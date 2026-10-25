import { sampleConversations, sampleMessages } from '@/lib/chat/sample'
import {
  allow,
  chatIdentity,
  chatResponse,
  ChatError,
  writeAccess,
  text,
  listConversations,
  findPeople,
  createConversation,
  listMessages,
  sendMessage,
  markRead,
} from '@/lib/chat/server'

export async function GET(request: Request) {
  try {
    const user = await chatIdentity(request)
    const params = new URL(request.url).searchParams
    const action = params.get('action') ?? 'conversations'
    let data: unknown
    if (action === 'conversations') {
      allow(user, 'conversation:read')
      data = user.guest ? sampleConversations : await listConversations(user.id)
    } else if (action === 'people') {
      allow(user, 'community:user:search')
      data = await findPeople(user.id, params.get('search') ?? '')
    } else if (action === 'messages') {
      allow(user, 'conversation:read')
      const id = text(params.get('id'), 200)
      data = user.guest
        ? {
            messages: sampleMessages.filter(
              (message) => message.conversationId === id,
            ),
            hasMore: false,
          }
        : await listMessages(
            user.id,
            id,
            params.get('before') ?? params.get('after'),
            params.has('after'),
          )
    } else throw new ChatError(400, '未知操作')
    return Response.json(data, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    return chatResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await chatIdentity(request)
    writeAccess(request)
    const raw = await request.text()
    if (raw.length > 20000) throw new ChatError(413, '请求过大')
    const body = JSON.parse(raw) as Record<string, unknown>
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new ChatError(400, '请求格式不正确')
    let data: unknown
    if (body.action === 'create') {
      allow(user, 'conversation:create')
      data = await createConversation(user.id, body)
    } else if (body.action === 'send') {
      allow(user, 'message:send')
      data = await sendMessage(user.id, text(body.id, 200), body)
    } else if (body.action === 'read') {
      allow(user, 'conversation:mark-read')
      data = await markRead(
        user.id,
        text(body.id, 200),
        text(body.messageId, 200),
      )
    } else throw new ChatError(400, '未知操作')
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return chatResponse(error)
  }
}
