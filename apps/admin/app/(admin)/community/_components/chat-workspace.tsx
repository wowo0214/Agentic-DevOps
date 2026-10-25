'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeftIcon, ChatCircleDotsIcon, MagnifyingGlassIcon, PaperPlaneTiltIcon, PlusIcon, UsersThreeIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Textarea } from '@repo/ui/textarea'
import { Checkbox } from '@repo/ui/checkbox'
import type { ChatUser, Conversation, Message, MessagePage } from '@/lib/chat/types'

async function request<T>(params: URLSearchParams | Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const get = params instanceof URLSearchParams
  const response = await fetch(get ? `/api/chat?${params}` : '/api/chat', {
    method: get ? 'GET' : 'POST', signal, cache: 'no-store',
    ...(!get && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? '请求失败')
  return data as T
}

type LocalMessage = Message & { status?: 'sending' | 'failed' }

// Confirmed messages keep server order; unconfirmed local ones trail, and drop out once their confirmed copy arrives.
function merge(list: LocalMessage[]) {
  const confirmed = new Map(list.filter((item) => !item.status).map((item) => [item.id, item]))
  const known = new Set([...confirmed.values()].map((item) => item.clientMessageId))
  return [...confirmed.values(), ...list.filter((item) => item.status && !known.has(item.clientMessageId))]
}

function time(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function Avatar({ name, group = false }: { name: string; group?: boolean }) {
  return <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-base font-semibold ${group ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'}`}>
    {group ? <UsersThreeIcon size={23} /> : name.slice(0, 1)}
  </span>
}

export function ChatWorkspace({ userId, guest }: { userId: string; guest: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)
  const [olderLoading, setOlderLoading] = useState(false)
  const [error, setError] = useState('')
  const [online, setOnline] = useState(false)
  const [creating, setCreating] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const queue = useRef<Promise<void>>(Promise.resolve())
  const pane = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const readCursor = useRef('')
  const loaded = useRef<{ id: string | null; latest: string | null }>({ id: null, latest: null })
  const current = conversations.find((item) => item.id === selectedId)
  const visibleMessages = messages.filter((item) => item.conversationId === selectedId)
  const draft = selectedId ? drafts[selectedId] ?? '' : ''

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    request<Conversation[]>(new URLSearchParams(), controller.signal)
      .then(setConversations).catch((err) => { if (!controller.signal.aborted) setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
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
    return () => source.close()
  }, [guest])

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') setRefresh((value) => value + 1) }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const controller = new AbortController()
    const initial = loaded.current.id !== selectedId
    if (initial) { setMessages((previous) => previous.filter((item) => item.status)); setHasMore(false); nearBottom.current = true }
    setMessageLoading(true)
    const load = async () => {
      let cursor = initial ? null : loaded.current.latest
      let incoming: Message[] = []
      let more = false
      do {
        const params = new URLSearchParams({ action: 'messages', id: selectedId })
        if (cursor) params.set('after', cursor)
        const page = await request<MessagePage>(params, controller.signal)
        incoming = [...incoming, ...page.messages]
        if (!cursor) { setHasMore(page.hasMore); more = false }
        else more = page.hasMore
        cursor = page.messages.at(-1)?.id ?? cursor
      } while (more)
      if (controller.signal.aborted) return
      loaded.current = { id: selectedId, latest: cursor }
      setMessages((previous) => {
        return merge([...previous, ...incoming])
      })
      if (nearBottom.current) {
        requestAnimationFrame(() => { if (!controller.signal.aborted && pane.current) pane.current.scrollTop = pane.current.scrollHeight })
        if (cursor && !guest && document.visibilityState === 'visible') {
          await request({ action: 'read', id: selectedId, messageId: cursor }, controller.signal)
          readCursor.current = cursor
        }
      }
    }
    void load().catch((err) => { if (!controller.signal.aborted) setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setMessageLoading(false) })
    return () => controller.abort()
  }, [selectedId, current?.latestId, guest, refresh])

  async function older() {
    if (!selectedId || !visibleMessages.length || olderLoading) return
    const id = selectedId
    const height = pane.current?.scrollHeight ?? 0
    setOlderLoading(true)
    try {
      const page = await request<MessagePage>(new URLSearchParams({ action: 'messages', id, before: visibleMessages[0].id }))
      if (loaded.current.id !== id) return
      setMessages((previous) => merge([...page.messages, ...previous]))
      setHasMore(page.hasMore)
      requestAnimationFrame(() => { if (pane.current) pane.current.scrollTop += pane.current.scrollHeight - height })
    } catch (err) { setError((err as Error).message) } finally { setOlderLoading(false) }
  }

  function deliver(payload: { id: string; content: string; clientMessageId: string }) {
    // Sends run one after another so messages from this tab keep their order.
    queue.current = queue.current.then(async () => {
      try {
        const saved = await request<Message>({ action: 'send', ...payload })
        setMessages((previous) => merge([...previous.filter((item) => item.clientMessageId !== payload.clientMessageId || !item.status), saved]))
        setConversations((previous) => {
          const hit = previous.find((item) => item.id === payload.id)
          return hit ? [{ ...hit, preview: saved.content, updatedAt: saved.createdAt, latestId: saved.id }, ...previous.filter((item) => item !== hit)] : previous
        })
      } catch (err) {
        setMessages((previous) => previous.map((item) => item.clientMessageId === payload.clientMessageId ? { ...item, status: 'failed' } : item))
        setError((err as Error).message)
      }
    })
  }

  function send() {
    const content = draft.trim()
    if (guest || !selectedId || !content) return
    const payload = { id: selectedId, content, clientMessageId: crypto.randomUUID() }
    setError('')
    setDrafts((previous) => ({ ...previous, [payload.id]: '' }))
    nearBottom.current = true
    setMessages((previous) => [...previous, { id: `local-${payload.clientMessageId}`, conversationId: payload.id, senderId: userId, senderName: '', content, createdAt: new Date().toISOString(), clientMessageId: payload.clientMessageId, status: 'sending' }])
    requestAnimationFrame(() => { if (pane.current) pane.current.scrollTop = pane.current.scrollHeight })
    deliver(payload)
  }

  function retry(message: LocalMessage) {
    setMessages((previous) => previous.map((item) => item.id === message.id ? { ...item, status: 'sending' } : item))
    deliver({ id: message.conversationId, content: message.content, clientMessageId: message.clientMessageId })
  }

  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-96 overflow-hidden border-t bg-background">
      <aside className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r md:w-72 xl:w-80`}>
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <div><h1 className="text-xl font-semibold tracking-tight">社群</h1><p className="mt-1 text-xs text-muted-foreground">{guest ? '只读示例 · 探索交流空间' : online ? '已连接 · 保留每一次交流' : '正在连接，断线消息会自动补收'}</p></div>
          <Button size="icon" variant="ghost" aria-label="新建会话" disabled={guest} onClick={() => setCreating(true)}><PlusIcon size={20} /></Button>
        </div>
        <div className="relative mx-4 mb-4"><MagnifyingGlassIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input aria-label="搜索会话" placeholder="搜索会话" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {conversations.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())).map((item) => (
            <button key={item.id} onClick={() => { setSelectedId(item.id); setError('') }} aria-pressed={selectedId === item.id} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${selectedId === item.id ? 'bg-sky-50 dark:bg-sky-950/50' : 'hover:bg-muted'}`}>
              <Avatar name={item.title} group={item.type === 'group'} />
              <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-2"><span className="truncate text-sm font-medium">{item.title}</span><time className="shrink-0 text-[10px] text-muted-foreground">{time(item.updatedAt)}</time></span><span className="mt-1 flex items-center gap-2"><span className="truncate text-xs text-muted-foreground">{item.preview || '开始第一条消息'}</span>{item.unread > 0 && <span className="ml-auto rounded-full bg-sky-600 px-1.5 text-[10px] leading-5 text-white">{item.unread > 99 ? '99+' : item.unread}</span>}</span></span>
            </button>
          ))}
          {!conversations.length && <p className="px-4 py-10 text-center text-sm text-muted-foreground">{loading ? '正在加载会话…' : '还没有会话，点击右上角 + 开始交流。'}</p>}
          {!!conversations.length && !conversations.some((item) => item.title.toLowerCase().includes(search.toLowerCase())) && <p className="p-6 text-center text-sm text-muted-foreground">没有匹配的会话</p>}
        </div>
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">{guest ? '示例消息不会写入真实会话' : '私聊与群聊 · 消息安全保存在服务端'}</div>
      </aside>

      <section className={`${selectedId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-slate-50/60 dark:bg-muted/10`}>
        {current ? <>
          <header className="flex items-center gap-3 border-b bg-background px-4 py-3">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="返回会话" onClick={() => setSelectedId(null)}><ArrowLeftIcon /></Button>
            <Avatar name={current.title} group={current.type === 'group'} />
            <div><h2 className="text-sm font-semibold">{current.title}</h2><p className="mt-0.5 text-xs text-muted-foreground">{current.type === 'group' ? `${current.memberCount} 位成员` : '1v1 对话'}{guest ? ' · 示例' : ''}</p></div>
          </header>
          <div ref={pane} className="flex-1 overflow-y-auto px-4 py-6 md:px-8" role="log" aria-label="聊天记录" onScroll={() => {
            const el = pane.current
            if (el) nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
            const cursor = loaded.current.id === selectedId ? loaded.current.latest : null
            if (nearBottom.current && cursor && readCursor.current !== cursor && !guest && document.visibilityState === 'visible') {
              readCursor.current = cursor
              void request({ action: 'read', id: selectedId, messageId: cursor }).catch(() => { readCursor.current = '' })
            }
          }}>
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {hasMore && <Button variant="ghost" size="sm" disabled={olderLoading} onClick={() => void older()}>{olderLoading ? '加载中…' : '加载更早的消息'}</Button>}
              {visibleMessages.map((message, index) => {
                const mine = message.senderId === userId
                const day = new Date(message.createdAt).toLocaleDateString('zh-CN')
                const previousDay = index ? new Date(visibleMessages[index - 1].createdAt).toLocaleDateString('zh-CN') : ''
                return <div key={message.id}>
                  {day !== previousDay && <div className="mb-5 text-center"><span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">{day}</span></div>}
                  <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-xs md:max-w-[70%] ${mine ? 'rounded-br-sm bg-sky-600 text-white' : 'rounded-bl-sm border bg-background'}`}>
                    {!mine && <p className="mb-1 text-xs font-medium text-sky-600 dark:text-sky-400">{message.senderName}</p>}
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">{message.content}</p>
                    <div className={`mt-1 text-right text-[10px] ${mine ? 'text-sky-100' : 'text-muted-foreground'}`}>{time(message.createdAt)}{mine && (message.status === 'sending' ? ' · 发送中…' : message.status === 'failed' ? <> · <button type="button" className="font-medium underline" onClick={() => retry(message)}>发送失败，点击重试</button></> : ' · 已发送')}</div>
                  </div></div>
                </div>
              })}
              {!visibleMessages.length && <div className="py-20 text-center text-sm text-muted-foreground">{messageLoading ? '正在加载消息…' : '打个招呼，开始这段对话吧。'}</div>}
            </div>
          </div>
          <div className="border-t bg-background px-4 py-3 md:px-6">
            <form className="flex items-end gap-3" onSubmit={(event) => { event.preventDefault(); send() }}>
              <Textarea aria-label="消息内容" placeholder={guest ? '体验模式仅可阅读示例消息' : '输入消息…'} disabled={guest} maxLength={5000} rows={2} className="max-h-40 min-h-12 resize-none border-0 bg-muted/50 shadow-none" value={draft} onChange={(event) => setDrafts((previous) => ({ ...previous, [selectedId!]: event.target.value }))} onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send() }
              }} />
              <Button type="submit" aria-label="发送消息" disabled={guest || !draft.trim()} className="size-11 rounded-xl bg-sky-600 text-white hover:bg-sky-700"><PaperPlaneTiltIcon size={20} /></Button>
            </form>
            <p className="mt-2 text-[10px] text-muted-foreground">{guest ? '示例体验 · 不能发送消息或创建会话' : 'Enter 发送 · Shift + Enter 换行'}</p>
          </div>
        </> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><span className="mb-5 rounded-3xl bg-sky-100 p-5 text-sky-600 dark:bg-sky-950"><ChatCircleDotsIcon size={42} /></span><h2 className="text-xl font-semibold">让交流从这里开始</h2><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">选择左侧会话，分享实验想法。<br />消息会保留，随时回来继续交流。</p>{!guest && <Button className="mt-6" onClick={() => setCreating(true)}><PlusIcon />新建会话</Button>}</div>}
        {error && <div role="alert" className="flex items-center justify-between gap-2 border-t bg-destructive/10 px-4 py-2 text-sm text-destructive"><span>{error}</span><Button variant="ghost" size="sm" onClick={() => { setError(''); setRefresh((value) => value + 1) }}>重新加载</Button></div>}
      </section>
      {!selectedId && error && <div role="alert" className="absolute bottom-4 left-4 rounded-lg bg-destructive p-3 text-sm text-white md:hidden">{error}</div>}
      {creating && <CreateConversation onClose={() => setCreating(false)} onCreated={(created) => {
        setCreating(false); setSelectedId(created.id); setError('')
        // Show the conversation straight away; the live stream keeps it in sync afterwards.
        setConversations((previous) => previous.some((item) => item.id === created.id) ? previous : [created, ...previous])
      }} />}
    </div>
  )
}

function CreateConversation({ onClose, onCreated }: { onClose: () => void; onCreated: (conversation: Conversation) => void }) {
  const [type, setType] = useState<'direct' | 'group'>('direct')
  const [title, setTitle] = useState('')
  const [search, setSearch] = useState('')
  const [people, setPeople] = useState<ChatUser[]>([])
  const [selected, setSelected] = useState<ChatUser[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { const el = dialog.current; el?.showModal(); return () => el?.close() }, [])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      request<ChatUser[]>(new URLSearchParams({ action: 'people', search }), controller.signal).then(setPeople)
        .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, search ? 150 : 0)
    return () => { clearTimeout(timer); controller.abort() }
  }, [search])
  async function create() {
    setBusy(true); setError('')
    try { const result = await request<{ id: string }>({ action: 'create', type, title, members: selected.map((user) => user.id) }); onCreated({ id: result.id, type, title: type === 'group' ? title.trim() : selected[0].name, preview: '', updatedAt: new Date().toISOString(), unread: 0, memberCount: selected.length + 1, latestId: null }) }
    catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }
  return <dialog ref={dialog} aria-labelledby="create-chat-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border bg-background p-6 text-foreground shadow-xl backdrop:bg-black/40">
    <div className="mb-5 flex items-center justify-between"><h2 id="create-chat-title" className="text-lg font-semibold">新建会话</h2><Button aria-label="关闭" variant="ghost" size="icon" disabled={busy} onClick={onClose}><XIcon /></Button></div>
    <div className="mb-4 flex gap-2">{(['direct', 'group'] as const).map((value) => <Button key={value} variant={type === value ? 'default' : 'outline'} disabled={busy} onClick={() => { setType(value); setSelected([]) }}>{value === 'direct' ? '1v1 私聊' : '创建群聊'}</Button>)}</div>
    {type === 'group' && <Input aria-label="群名称" placeholder="群名称" maxLength={80} value={title} disabled={busy} onChange={(event) => setTitle(event.target.value)} className="mb-3" />}
    <Input aria-label="查找用户" placeholder="按姓名查找用户" value={search} disabled={busy} onChange={(event) => setSearch(event.target.value)} />
    <p className="my-2 text-xs text-muted-foreground">{selected.length ? `已选：${selected.map((user) => user.name).join('、')}` : '选择你想交流的对象，不区分平台角色'}</p>
    <div className="my-3 max-h-60 min-h-24 overflow-y-auto">{people.map((user) => <label key={user.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-muted"><Checkbox disabled={busy} checked={selected.some((item) => item.id === user.id)} onCheckedChange={(checked) => setSelected((previous) => checked ? type === 'direct' ? [user] : [...previous, user] : previous.filter((item) => item.id !== user.id))} /><Avatar name={user.name} /><span className="text-sm">{user.name}</span></label>)}{loading ? <p className="p-4 text-sm text-muted-foreground">正在查找…</p> : !people.length && <p className="p-4 text-sm text-muted-foreground">没有匹配的用户</p>}</div>
    {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
    <Button className="w-full" disabled={busy || !selected.length || selected.length > 49 || (type === 'group' && !title.trim())} onClick={() => void create()}>{busy ? '正在创建…' : type === 'direct' ? '开始聊天' : '创建群聊'}</Button>
  </dialog>
}
