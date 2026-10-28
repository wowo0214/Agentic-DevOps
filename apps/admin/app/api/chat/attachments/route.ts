import { saveAttachment } from '@/lib/chat/attachments'
import { allow, chatIdentity, errorResponse } from '@/lib/chat/server'
import { R } from '@repo/http-contract'

export async function POST(request: Request) {
  try {
    const user = await chatIdentity(request)
    allow(user, 'message:send')
    const upload = (await request.formData()).get('file')
    if (!(upload instanceof File)) throw R.error('请选择要上传的文件', 400)
    return R.created(await saveAttachment(user.id, upload))
  } catch (error) {
    return errorResponse(error)
  }
}
