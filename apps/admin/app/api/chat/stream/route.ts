import {
  allow,
  chatIdentity,
  chatResponse,
  listConversations,
} from '@/lib/chat/server'

export async function GET(request: Request) {
  try {
    const user = await chatIdentity(request)
    allow(user, 'conversation:read')
    if (user.guest) return new Response(null, { status: 204 })
    const encoder = new TextEncoder()
    let stop = (_cancelled = false) => {}
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let stopped = false
        let timer: ReturnType<typeof setTimeout> | undefined
        let previous = ''
        const abort = () => stop()
        stop = (cancelled = false) => {
          if (stopped) return
          stopped = true
          clearTimeout(timer)
          request.signal.removeEventListener('abort', abort)
          if (!cancelled) controller.close()
        }
        request.signal.addEventListener('abort', abort, { once: true })
        if (request.signal.aborted) {
          stop()
          return
        }
        const tick = async () => {
          try {
            const current = await chatIdentity(request)
            if (
              current.guest ||
              current.id !== user.id ||
              !current.has('conversation:read')
            ) {
              stop()
              return
            }
            const data = JSON.stringify(await listConversations(user.id))
            if (stopped) return
            if (data !== previous) {
              controller.enqueue(
                encoder.encode(`event: conversations\ndata: ${data}\n\n`),
              )
              previous = data
            } else controller.enqueue(encoder.encode(': heartbeat\n\n'))
            timer = setTimeout(tick, 4000)
          } catch {
            stop()
          }
        }
        controller.enqueue(encoder.encode('retry: 4000\n\n'))
        void tick()
      },
      cancel() {
        stop(true)
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'private, no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    return chatResponse(error)
  }
}
