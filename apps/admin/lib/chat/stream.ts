import { subscribeChatEvents } from './events'
import { listConversations } from './server'
import type { Principal } from '@/lib/permissions/server'
import 'server-only'

const encoder = new TextEncoder()

// Keeps idle proxies from closing the connection
const HEARTBEAT_MS = 25_000

type Write = (text: string) => void

const sseEvent = (event: string, data: string) =>
  `event: ${event}\ndata: ${data}\n\n`

export function sseResponse(body: ReadableStream<Uint8Array>) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'private, no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}

// Pushes all conversations when they changed
function conversationSyncer(user: Principal, write: Write) {
  let lastSnapshot = ''
  let syncing = Promise.resolve()

  return () => {
    syncing = syncing
      .then(async () => {
        const data = JSON.stringify(await listConversations(user.id))
        if (data === lastSnapshot) return
        lastSnapshot = data
        write(sseEvent('conversations', data))
      })
      .catch((error) => console.error('Chat stream sync failed', error))
  }
}

// Live stream: conversation snapshots, plus each new message as `changed`
export function conversationStream(request: Request, user: Principal) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const write: Write = (text) => {
        // No writes after the client has gone
        if (!request.signal.aborted) controller.enqueue(encoder.encode(text))
      }
      const syncConversations = conversationSyncer(user, write)

      // Subscribe first so no change is missed
      const unsubscribe = await subscribeChatEvents(user.id, (payload) => {
        if (payload) write(sseEvent('changed', payload))
        syncConversations()
      })
      // The client left while subscribing
      if (request.signal.aborted) return void unsubscribe()

      const heartbeat = setInterval(
        () => write(': heartbeat\n\n'),
        HEARTBEAT_MS,
      )
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        void unsubscribe()
      })

      // Reconnect interval and init sync conversation
      write('retry: 4000\n\n')
      syncConversations()
    },
  })
}
