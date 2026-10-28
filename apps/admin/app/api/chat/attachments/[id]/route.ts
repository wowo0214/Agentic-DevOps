import { attachmentResponse } from '@/lib/chat/attachments'
import { allow, chatIdentity, errorResponse } from '@/lib/chat/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await chatIdentity(request)
    allow(user, 'conversation:read')
    return await attachmentResponse(user.id, (await params).id)
  } catch (error) {
    return errorResponse(error)
  }
}
