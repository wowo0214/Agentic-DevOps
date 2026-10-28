'use client'

import { CheckIcon, ClockIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Bubble, BubbleContent, BubbleReactions } from '@repo/ui/bubble'
import { Button } from '@repo/ui/button'
import { Marker, MarkerContent } from '@repo/ui/marker'
import {
  Message as MessageRow,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from '@repo/ui/message'
import { MessageScrollerItem } from '@repo/ui/message-scroller'
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/popover'
import { AttachmentCard } from './attachment-card'
import { ChatAvatar } from './chat-avatar'
import { time } from './format'
import type { LocalMessage } from './use-chat'

const REACTIONS = ['👍', '❤️', '😂', '🎉', '😮', '😢']

// Telegram colors: own bubbles are light green (purple in dark mode), incoming ones white (dark gray in dark mode).
const OWN =
  '*:data-[slot=bubble-content]:bg-[#eeffde] *:data-[slot=bubble-content]:text-black dark:*:data-[slot=bubble-content]:bg-[#8774e1] dark:*:data-[slot=bubble-content]:text-white'
const INCOMING =
  '*:data-[slot=bubble-content]:bg-white *:data-[slot=bubble-content]:text-black dark:*:data-[slot=bubble-content]:bg-[#212121] dark:*:data-[slot=bubble-content]:text-white'

// One message in Telegram's layout: the time and delivery status sit inside the bubble, and the corners next to
// neighbouring bubbles of the same sender are tighter. Click the bubble to react.
export function MessageItem({
  message,
  mine,
  direct,
  day,
  first,
  last,
  emojis,
  onReact,
  onRetry,
}: {
  message: LocalMessage
  mine: boolean
  direct: boolean
  // Set on the first message of a day.
  day: string | null
  // First and last message of a run from the same sender.
  first: boolean
  last: boolean
  emojis: string[]
  onReact: (emoji: string) => void
  onRetry: () => void
}) {
  const [picking, setPicking] = useState(false)
  const text = message.content !== message.attachments[0]?.name
  const corners = mine
    ? `rounded-br-md ${first ? '' : 'rounded-tr-md'}`
    : `rounded-bl-md ${first ? '' : 'rounded-tl-md'}`
  const surface = `block whitespace-pre-wrap rounded-[15px] px-2.5 py-1.5 text-[15px] leading-snug ${corners}`
  const meta = (
    <span
      className={`float-right ml-3 mt-2 inline-flex items-center gap-0.5 text-[11px] leading-none ${mine ? 'text-[#4fae4e] dark:text-white/70' : 'text-[#686c72] dark:text-white/50'}`}
    >
      {time(message.createdAt)}
      {mine &&
        (message.status === 'sending' ? (
          <ClockIcon />
        ) : message.status === 'failed' ? (
          <button
            type="button"
            className="ml-1 font-medium text-destructive underline"
            onClick={onRetry}
          >
            发送失败，点击重试
          </button>
        ) : (
          <CheckIcon />
        ))}
    </span>
  )
  return (
    <MessageScrollerItem
      messageId={message.id}
      className={`[content-visibility:visible] ${first ? 'mt-2' : ''}`}
    >
      {day && (
        <Marker className="mb-2 justify-center">
          <MarkerContent className="rounded-full bg-black/30 px-3 py-0.5 text-xs font-medium text-white backdrop-blur">
            {day}
          </MarkerContent>
        </Marker>
      )}
      <MessageRow align={mine ? 'end' : 'start'}>
        {direct && !mine && (
          <MessageAvatar>
            {last && (
              <ChatAvatar
                name={message.senderName}
                image={message.senderImage}
              />
            )}
          </MessageAvatar>
        )}
        <MessageContent className="gap-0">
          {!mine && !direct && (
            <MessageHeader className="font-normal">
              {message.senderName}
            </MessageHeader>
          )}
          <Bubble
            variant={mine ? 'default' : 'secondary'}
            className={`${mine ? OWN : INCOMING} ${emojis.length ? 'mb-3' : ''}`}
          >
            {text ? (
              <Popover open={picking} onOpenChange={setPicking}>
                <PopoverTrigger
                  data-slot="bubble-content"
                  nativeButton={false}
                  render={
                    <BubbleContent className={`cursor-pointer ${surface}`} />
                  }
                >
                  {message.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="mb-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <AttachmentCard file={file} />
                    </div>
                  ))}
                  {message.content}
                  {meta}
                </PopoverTrigger>
                <PopoverContent
                  align={mine ? 'end' : 'start'}
                  className="w-auto flex-row gap-0.5 p-1"
                >
                  {REACTIONS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="icon"
                      className="text-lg"
                      onClick={() => {
                        onReact(emoji)
                        setPicking(false)
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              <BubbleContent className={surface}>
                {message.attachments.map((file) => (
                  <AttachmentCard key={file.id} file={file} />
                ))}
                {meta}
              </BubbleContent>
            )}
            {emojis.length > 0 && (
              <BubbleReactions align={mine ? 'end' : 'start'}>
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="rounded-full px-1.5 py-0.5"
                    onClick={() => onReact(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </BubbleReactions>
            )}
          </Bubble>
        </MessageContent>
      </MessageRow>
    </MessageScrollerItem>
  )
}
