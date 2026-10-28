import { useCallback, useEffect, useRef, useState } from 'react'
import { request } from './chat-api'
import type {
  Attachment,
  Conversation,
  Message,
  MessagePage,
} from '@/lib/chat/types'

export type LocalMessage = Message & { status?: 'sending' | 'failed' }

// Confirmed messages keep server order; unconfirmed local ones trail, and drop out once their confirmed copy arrives.
function merge(list: LocalMessage[]) {
  const confirmed = new Map(
    list.filter((item) => !item.status).map((item) => [item.id, item]),
  )
  const known = new Set(
    [...confirmed.values()].map((item) => item.clientMessageId),
  )
  return [
    ...confirmed.values(),
    ...list.filter((item) => item.status && !known.has(item.clientMessageId)),
  ]
}

// Conversations, messages and sending for the community page: loading, live updates (SSE), read markers and uploads.
export function useChat({
  userId,
  userName,
  userImage,
  guest,
}: {
  userId: string
  userName: string
  userImage: string | null
  guest: boolean
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)
  const [olderLoading, setOlderLoading] = useState(false)
  const [error, setError] = useState('')
  const [online, setOnline] = useState(false)
  const [refresh, setRefresh] = useState(0)
  // The file picked for the next message: `uploading` while it is sent to the server, `attached` once stored.
  const [uploading, setUploading] = useState<File | null>(null)
  const [attached, setAttached] = useState<Attachment | null>(null)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const pulling = useRef<Promise<void>>(Promise.resolve())
  const pending = useRef<string | null>(null)
  const selectedRef = useRef<string | null>(null)
  const applyRef = useRef<(message: Message) => Promise<void>>(async () => {})
  const scrollToEnd = useRef<(() => void) | null>(null)
  const nearBottom = useRef(true)
  const readCursor = useRef('')
  // `latest` is the last message id fetched and `seq` its order number; seq lets event messages prove they are contiguous.
  const loaded = useRef<{
    id: string | null
    latest: string | null
    seq: number
  }>({ id: null, latest: null, seq: 0 })
  const current = conversations.find((item) => item.id === selectedId)
  const visibleMessages = messages.filter(
    (item) => item.conversationId === selectedId,
  )
  const draft = selectedId ? (drafts[selectedId] ?? '') : ''

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    request<Conversation[]>(new URLSearchParams(), controller.signal)
      .then(setConversations)
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [refresh])

  useEffect(() => {
    if (guest) return
    const source = new EventSource('/api/chat/stream')
    source.onopen = () => setOnline(true)
    source.onerror = () => setOnline(false)
    source.addEventListener('conversations', (event) => {
      setConversations(JSON.parse((event as MessageEvent).data))
    })
    // A message was added somewhere: if it is in the open conversation, show it straight from the event.
    source.addEventListener('changed', (event) => {
      const { message } = JSON.parse((event as MessageEvent).data) as {
        message: Message
      }
      if (message.conversationId !== selectedRef.current) return
      pulling.current = pulling.current.then(() => applyRef.current(message))
    })
    return () => source.close()
  }, [guest])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible')
        setRefresh((value) => value + 1)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const controller = new AbortController()
    const initial = loaded.current.id !== selectedId
    // The event path already has (or is fetching) exactly this latest message; do not fetch it again.
    if (
      !initial &&
      current?.latestId &&
      (loaded.current.latest === current.latestId ||
        pending.current === current.latestId)
    )
      return
    if (initial) {
      setMessages((previous) => previous.filter((item) => item.status))
      setHasMore(false)
      nearBottom.current = true
    }
    setMessageLoading(true)
    const load = async () => {
      let cursor = initial ? null : loaded.current.latest
      let seq = initial ? 0 : loaded.current.seq
      let incoming: Message[] = []
      let more = false
      do {
        const params = new URLSearchParams({
          action: 'messages',
          id: selectedId,
        })
        if (cursor) params.set('after', cursor)
        const page = await request<MessagePage>(params, controller.signal)
        incoming = [...incoming, ...page.messages]
        if (!cursor) {
          setHasMore(page.hasMore)
          more = false
        } else more = page.hasMore
        cursor = page.messages.at(-1)?.id ?? cursor
        seq = page.messages.at(-1)?.seq ?? seq
      } while (more)
      if (controller.signal.aborted) return
      loaded.current = { id: selectedId, latest: cursor, seq }
      setMessages((previous) => {
        return merge([...previous, ...incoming])
      })
      if (
        nearBottom.current &&
        cursor &&
        !guest &&
        document.visibilityState === 'visible'
      ) {
        await request(
          { action: 'read', id: selectedId, messageId: cursor },
          controller.signal,
        )
        readCursor.current = cursor
      }
    }
    void load()
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setMessageLoading(false)
      })
    return () => controller.abort()
  }, [selectedId, current?.latestId, guest, refresh])

  // Show a message that arrived in an event. If it directly follows what is loaded (seq + 1) it is appended with no
  // request; on any gap (missed event, reconnect) fetch from the cursor so nothing is skipped. Postgres stays the truth.
  async function apply(message: Message) {
    const id = message.conversationId
    if (loaded.current.id !== id || loaded.current.latest === message.id) return
    if (message.seq !== undefined && message.seq === loaded.current.seq + 1) {
      loaded.current = { id, latest: message.id, seq: message.seq }
      setMessages((previous) => merge([...previous, message]))
      if (nearBottom.current) markRead(id, message)
      return
    }
    pending.current = message.id
    try {
      let cursor = loaded.current.latest
      let seq = loaded.current.seq
      let incoming: Message[] = []
      let more = false
      do {
        const params = new URLSearchParams({ action: 'messages', id })
        if (cursor) params.set('after', cursor)
        const page = await request<MessagePage>(params)
        incoming = [...incoming, ...page.messages]
        more = page.hasMore
        cursor = page.messages.at(-1)?.id ?? cursor
        seq = page.messages.at(-1)?.seq ?? seq
      } while (more)
      if (loaded.current.id !== id) return
      loaded.current = { id, latest: cursor, seq }
      setMessages((previous) => merge([...previous, ...incoming]))
      pending.current = null
      if (nearBottom.current && cursor) markRead(id, incoming.at(-1) ?? message)
    } catch {
      // Fall back to the normal reload path.
      setRefresh((value) => value + 1)
    } finally {
      if (pending.current === message.id) pending.current = null
    }
  }

  // Own messages never count as unread, so only messages from others need a read marker request.
  function markRead(id: string, message: Message) {
    if (guest || message.senderId === userId) return
    if (document.visibilityState !== 'visible') return
    readCursor.current = message.id
    void request({ action: 'read', id, messageId: message.id }).catch(() => {
      readCursor.current = ''
    })
  }

  // Keep the SSE handler (registered once) pointed at the latest selection and apply function.
  useEffect(() => {
    selectedRef.current = selectedId
    applyRef.current = apply
  })

  // Tracks whether the reader is at the bottom, and marks the latest message read once they are.
  function handleScroll(el: HTMLElement) {
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    const cursor =
      loaded.current.id === selectedId ? loaded.current.latest : null
    if (
      nearBottom.current &&
      cursor &&
      readCursor.current !== cursor &&
      !guest &&
      document.visibilityState === 'visible'
    ) {
      readCursor.current = cursor
      void request({
        action: 'read',
        id: selectedId,
        messageId: cursor,
      }).catch(() => {
        readCursor.current = ''
      })
    }
  }

  const bindScrollToEnd = useCallback((fn: () => void) => {
    scrollToEnd.current = fn
  }, [])

  async function older() {
    if (!selectedId || !visibleMessages.length || olderLoading) return
    const id = selectedId
    setOlderLoading(true)
    try {
      const page = await request<MessagePage>(
        new URLSearchParams({
          action: 'messages',
          id,
          before: visibleMessages[0].id,
        }),
      )
      if (loaded.current.id !== id) return
      setMessages((previous) => merge([...page.messages, ...previous]))
      setHasMore(page.hasMore)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setOlderLoading(false)
    }
  }

  async function attach(file: File) {
    setError('')
    setUploading(file)
    try {
      const form = new FormData()
      form.set('file', file)
      setAttached(await request<Attachment>(form))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(null)
    }
  }

  function deliver(payload: {
    id: string
    content: string
    clientMessageId: string
    attachmentId?: string
  }) {
    // Sends run one after another so messages from this tab keep their order.
    queue.current = queue.current.then(async () => {
      try {
        const saved = await request<Message>({ action: 'send', ...payload })
        setMessages((previous) =>
          merge([
            ...previous.filter(
              (item) =>
                item.clientMessageId !== payload.clientMessageId ||
                !item.status,
            ),
            saved,
          ]),
        )
        setConversations((previous) => {
          const hit = previous.find((item) => item.id === payload.id)
          return hit
            ? [
                {
                  ...hit,
                  preview: saved.content,
                  updatedAt: saved.createdAt,
                  latestId: saved.id,
                },
                ...previous.filter((item) => item !== hit),
              ]
            : previous
        })
      } catch (err) {
        setMessages((previous) =>
          previous.map((item) =>
            item.clientMessageId === payload.clientMessageId
              ? { ...item, status: 'failed' }
              : item,
          ),
        )
        setError((err as Error).message)
      }
    })
  }

  function send() {
    // A file sent without text uses its name as the message text.
    const content = draft.trim() || attached?.name
    if (guest || !selectedId || uploading || !content) return
    const payload = {
      id: selectedId,
      content,
      clientMessageId: crypto.randomUUID(),
      attachmentId: attached?.id,
    }
    setError('')
    setDrafts((previous) => ({ ...previous, [payload.id]: '' }))
    setAttached(null)
    nearBottom.current = true
    setMessages((previous) => [
      ...previous,
      {
        id: `local-${payload.clientMessageId}`,
        conversationId: payload.id,
        senderId: userId,
        senderName: userName,
        senderImage: userImage,
        attachments: attached ? [attached] : [],
        content,
        createdAt: new Date().toISOString(),
        clientMessageId: payload.clientMessageId,
        status: 'sending',
      },
    ])
    scrollToEnd.current?.()
    deliver(payload)
  }

  function retry(message: LocalMessage) {
    setMessages((previous) =>
      previous.map((item) =>
        item.id === message.id ? { ...item, status: 'sending' } : item,
      ),
    )
    deliver({
      id: message.conversationId,
      content: message.content,
      clientMessageId: message.clientMessageId,
      attachmentId: message.attachments[0]?.id,
    })
  }

  function select(id: string | null) {
    setSelectedId(id)
    setAttached(null)
    setError('')
  }

  // Show a just-created conversation straight away; the live stream keeps it in sync afterwards.
  function open(created: Conversation) {
    select(created.id)
    setConversations((previous) =>
      previous.some((item) => item.id === created.id)
        ? previous
        : [created, ...previous],
    )
  }

  function reload() {
    setError('')
    setRefresh((value) => value + 1)
  }

  return {
    conversations,
    selectedId,
    current,
    messages: visibleMessages,
    hasMore,
    loading,
    messageLoading,
    olderLoading,
    online,
    error,
    draft,
    attached,
    uploading,
    setDraft: (value: string) => {
      if (selectedId)
        setDrafts((previous) => ({ ...previous, [selectedId]: value }))
    },
    removeAttachment: () => setAttached(null),
    select,
    open,
    reload,
    older,
    attach,
    send,
    retry,
    handleScroll,
    bindScrollToEnd,
  }
}

export type Chat = ReturnType<typeof useChat>
