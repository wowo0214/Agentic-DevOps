import { after } from 'next/server'
import { publishChatEvent } from '@/lib/chat/events'
import { sampleConversations, sampleMessages } from '@/lib/chat/sample'
import {
  allow,
  chatIdentity,
  errorResponse,
  text,
  listConversations,
  findPeople,
  createConversation,
  listMessages,
  sendMessage,
  markRead,
} from '@/lib/chat/server'
import { R } from '@repo/http-contract'
import type { Principal } from '@/lib/permissions/server'

const MAX_ID_LENGTH = 200

// Chat data is private: keep it out of shared caches.
const ok = (data: unknown) => {
  const response = R.ok(data)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export async function GET(request: Request) {
  try {
    const user = await chatIdentity(request)
    const params = new URL(request.url).searchParams
    return ok(await readChat(user, params))
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await chatIdentity(request)
    return ok(await writeChat(user, request))
  } catch (error) {
    return errorResponse(error)
  }
}

// Guests read the sample data instead of the database.
async function readChat(user: Principal, params: URLSearchParams) {
  const isGuest = user.role === 'guest'
  const action = params.get('action') ?? 'conversations'
  if (action === 'conversations') {
    allow(user, 'conversation:read')
    return isGuest ? sampleConversations : listConversations(user.id)
  }
  if (action === 'people') {
    allow(user, 'community:user:search')
    return findPeople(user.id, params.get('search') ?? '')
  }
  if (action === 'messages') {
    allow(user, 'conversation:read')
    const id = text(params.get('id'), MAX_ID_LENGTH)
    if (isGuest) {
      const messages = sampleMessages.filter(
        (message) => message.conversationId === id,
      )
      return { messages, hasMore: false }
    }
    // `after` loads newer messages than the cursor, otherwise older ones (`before`).
    const newer = params.has('after')
    return listMessages(
      user.id,
      id,
      params.get(newer ? 'after' : 'before'),
      newer,
    )
  }
  throw R.error('未知操作', 400)
}

async function writeChat(user: Principal, request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  if (body?.action === 'create') {
    allow(user, 'conversation:create')
    const { memberIds, ...created } = await createConversation(user.id, body)
    // Everyone in the new conversation sees it in their list.
    after(() => publishChatEvent(memberIds))
    return created
  }
  if (body?.action === 'send') {
    allow(user, 'message:send')
    const id = text(body.id, MAX_ID_LENGTH)
    const { message, memberIds } = await sendMessage(user.id, id, body)
    // Runs after the response is sent, so publishing never delays the sender.
    after(() => publishChatEvent(memberIds, message))
    return message
  }
  if (body?.action === 'read') {
    allow(user, 'conversation:mark-read')
    const result = await markRead(
      user.id,
      text(body.id, MAX_ID_LENGTH),
      text(body.messageId, MAX_ID_LENGTH),
    )
    // Unread counts changed: refresh this user's other tabs.
    after(() => publishChatEvent([user.id]))
    return result
  }
  throw R.error('未知操作', 400)
}
