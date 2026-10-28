'use client'

import {
  FileIcon,
  PaperclipIcon,
  PaperPlaneRightIcon,
  XIcon,
} from '@phosphor-icons/react'
import { useRef } from 'react'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@repo/ui/attachment'
import { Button } from '@repo/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@repo/ui/input-group'
import { formatSize } from './format'
import type { Attachment as AttachmentInfo } from '@/lib/chat/types'

// Telegram's message box: a rounded input with the attach button inside, and a round blue send button beside it.
export function Composer({
  guest,
  draft,
  attached,
  uploading,
  onDraft,
  onAttach,
  onRemove,
  onSend,
}: {
  guest: boolean
  draft: string
  attached: AttachmentInfo | null
  uploading: File | null
  onDraft: (value: string) => void
  onAttach: (file: File) => void
  onRemove: () => void
  onSend: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const file = attached ?? uploading
  return (
    <form
      className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-3 py-3 md:px-0"
      onSubmit={(event) => {
        event.preventDefault()
        onSend()
      }}
    >
      <input
        ref={fileInput}
        type="file"
        hidden
        onChange={(event) => {
          const picked = event.target.files?.[0]
          event.target.value = ''
          if (picked) onAttach(picked)
        }}
      />
      {file && (
        <Attachment
          size="sm"
          state={uploading ? 'uploading' : 'done'}
          className="bg-background"
        >
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
            <AttachmentAction
              aria-label="移除附件"
              disabled={!!uploading}
              onClick={onRemove}
            >
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      )}
      <div className="flex items-end gap-2">
        <InputGroup className="min-h-11 flex-1 rounded-3xl border-0 bg-background shadow-sm">
          <InputGroupTextarea
            aria-label="消息内容"
            placeholder={guest ? '体验模式仅可阅读示例消息' : '输入消息…'}
            disabled={guest}
            maxLength={5000}
            rows={1}
            className="max-h-40 min-h-11 py-3 pl-4"
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                onSend()
              }
            }}
          />
          <InputGroupAddon align="inline-end" className="self-end pb-1.5">
            <InputGroupButton
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="添加附件"
              disabled={guest || !!uploading}
              onClick={() => fileInput.current?.click()}
            >
              <PaperclipIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button
          type="submit"
          size="icon"
          className="size-11 shrink-0 rounded-full bg-[#3390ec] text-white shadow-sm hover:bg-[#2b7fd0]"
          aria-label="发送消息"
          disabled={guest || !!uploading || (!draft.trim() && !attached)}
        >
          <PaperPlaneRightIcon weight="fill" />
        </Button>
      </div>
    </form>
  )
}
