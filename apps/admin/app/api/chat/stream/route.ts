import { allow, chatIdentity, errorResponse } from '@/lib/chat/server'
import { conversationStream, sseResponse } from '@/lib/chat/stream'
import { R } from '@repo/http-contract'

export async function GET(request: Request) {
  try {
    const user = await chatIdentity(request)
    allow(user, 'conversation:read')
    if (user.role === 'guest') return R.noContent()
    return sseResponse(conversationStream(request, user))
  } catch (error) {
    return errorResponse(error)
  }
}
