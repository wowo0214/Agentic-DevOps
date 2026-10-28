import { DownloadSimpleIcon, FileIcon } from '@phosphor-icons/react'
import Image from 'next/image'
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@repo/ui/attachment'
import { formatSize } from './format'
import type { Attachment as AttachmentInfo } from '@/lib/chat/types'

// Images show a thumbnail and other files show name and size; either way the whole card opens the file.
export function AttachmentCard({ file }: { file: AttachmentInfo }) {
  const url = `/api/chat/attachments/${file.id}`
  const image = /^image\/(png|jpeg|gif|webp)$/.test(file.type)
  return (
    <Attachment>
      {image ? (
        <AttachmentMedia variant="image" className="w-48">
          <Image
            src={url}
            alt={file.name}
            width={192}
            height={192}
            unoptimized
          />
        </AttachmentMedia>
      ) : (
        <>
          <AttachmentMedia>
            <FileIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              {formatSize(file.size)}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <DownloadSimpleIcon />
          </AttachmentActions>
        </>
      )}
      <AttachmentTrigger
        render={
          image ? (
            <a href={url} target="_blank" rel="noreferrer" />
          ) : (
            <a href={url} download={file.name} />
          )
        }
        aria-label={file.name}
      />
    </Attachment>
  )
}
