import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { file as storedFile, write } from 'bun'
import { db } from '@/app/prisma/db'
import { R } from '@repo/http-contract'
import { requireMember } from './server'
import type { Attachment } from './types'
import 'server-only'

// Files live on local disk under their attachment id; name, type and size live in message_attachment.
const DIR = join(process.cwd(), '.uploads', 'chat')
const MAX_SIZE = 10 * 1024 * 1024

// Stores the file as a pending attachment; it is linked to a message when that message is sent.
export async function saveAttachment(userId: string, upload: File) {
  if (!upload.size || upload.size > MAX_SIZE)
    throw R.error('文件为空或超过 10 MB', 400)
  const attachment: Attachment = {
    id: randomUUID(),
    name: upload.name.slice(0, 200) || 'file',
    type: upload.type || 'application/octet-stream',
    size: upload.size,
  }
  await write(join(DIR, attachment.id), upload)
  await db.orm.public.messageAttachment.create({
    id: attachment.id,
    uploaderId: userId,
    fileName: attachment.name,
    mimeType: attachment.type,
    size: attachment.size,
  })
  return attachment
}

export async function attachmentResponse(userId: string, id: string) {
  const attachment = await db.orm.public.messageAttachment.where({ id }).first()
  if (!attachment) throw R.error('附件不存在或不可访问', 404)
  // The uploader may open a file before sending it; everyone else must be in the message's conversation.
  if (attachment.uploaderId !== userId) {
    const message = attachment.messageId
      ? await db.orm.public.message.where({ id: attachment.messageId }).first()
      : null
    if (!message) throw R.error('附件不存在或不可访问', 404)
    await requireMember(userId, message.conversationId)
  }
  // Only safe raster images render inline; everything else downloads so uploaded HTML or SVG never runs here.
  const inline = /^image\/(png|jpeg|gif|webp)$/.test(attachment.mimeType)
  const name = encodeURIComponent(attachment.fileName)
  // A file stream is not a JSON envelope, so this is a plain Response rather than R.
  return new Response(storedFile(join(DIR, attachment.id)), {
    headers: {
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${name}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
