'use client'

import { useEffect, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Empty, EmptyDescription } from '@repo/ui/empty'
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@repo/ui/message-scroller'
import { MessageItem } from './message-item'
import type { LocalMessage } from './use-chat'

// Hooks only work inside the scroller provider, so this hands scrollToEnd out to the parent.
function ScrollToEnd({
  onBind,
}: {
  onBind: (scrollToEnd: () => void) => void
}) {
  const { scrollToEnd } = useMessageScroller()
  useEffect(() => onBind(() => void scrollToEnd()), [onBind, scrollToEnd])
  return null
}

const dayOf = (value: string) => new Date(value).toLocaleDateString('zh-CN')

export function MessageList({
  conversationId,
  direct,
  userId,
  messages,
  hasMore,
  olderLoading,
  messageLoading,
  onOlder,
  onRetry,
  onScroll,
  onBindScrollToEnd,
}: {
  conversationId: string
  direct: boolean
  userId: string
  messages: LocalMessage[]
  hasMore: boolean
  olderLoading: boolean
  messageLoading: boolean
  onOlder: () => void
  onRetry: (message: LocalMessage) => void
  onScroll: (el: HTMLElement) => void
  onBindScrollToEnd: (scrollToEnd: () => void) => void
}) {
  // Reactions are local to this page for now: message id -> emojis.
  const [reactions, setReactions] = useState<Record<string, string[]>>({})
  function react(id: string, emoji: string) {
    setReactions((previous) => {
      const list = previous[id] ?? []
      return {
        ...previous,
        [id]: list.includes(emoji)
          ? list.filter((item) => item !== emoji)
          : [...list, emoji],
      }
    })
  }
  return (
    <>
      {hasMore && (
        <div className="flex justify-center border-b bg-background py-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={olderLoading}
            onClick={onOlder}
          >
            {olderLoading ? '加载中…' : '加载更早的消息'}
          </Button>
        </div>
      )}
      <MessageScrollerProvider
        key={conversationId}
        autoScroll
        scrollEdgeThreshold={80}
      >
        <ScrollToEnd onBind={onBindScrollToEnd} />
        <MessageScroller className="flex-1">
          <MessageScrollerViewport
            className="px-4 md:px-8"
            role="log"
            aria-label="聊天记录"
            onScroll={(event) => onScroll(event.currentTarget)}
          >
            <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-0.5 py-4">
              {messages.map((message, index) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  mine={message.senderId === userId}
                  direct={direct}
                  day={
                    index &&
                    dayOf(messages[index - 1].createdAt) ===
                      dayOf(message.createdAt)
                      ? null
                      : dayOf(message.createdAt)
                  }
                  first={
                    messages[index - 1]?.senderId !== message.senderId ||
                    dayOf(messages[index - 1].createdAt) !==
                      dayOf(message.createdAt)
                  }
                  last={messages[index + 1]?.senderId !== message.senderId}
                  emojis={reactions[message.id] ?? []}
                  onReact={(emoji) => react(message.id, emoji)}
                  onRetry={() => onRetry(message)}
                />
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          {!messages.length && (
            <Empty className="pointer-events-none absolute inset-0">
              <EmptyDescription>
                {messageLoading
                  ? '正在加载消息…'
                  : '打个招呼，开始这段对话吧。'}
              </EmptyDescription>
            </Empty>
          )}
        </MessageScroller>
      </MessageScrollerProvider>
    </>
  )
}
