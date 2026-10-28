'use client'

import {
  ArrowLeftIcon,
  ChatCircleDotsIcon,
  PlusIcon,
} from '@phosphor-icons/react'
import { Button } from '@repo/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui/empty'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@repo/ui/item'
import { ChatAvatar } from './chat-avatar'
import { Composer } from './composer'
import { MessageList } from './message-list'
import type { Chat } from './use-chat'

// Right column: the open conversation (header, messages, message box), or a prompt to pick one.
export function ChatPane({
  chat,
  userId,
  guest,
  onCreate,
}: {
  chat: Chat
  userId: string
  guest: boolean
  onCreate: () => void
}) {
  const { current } = chat
  if (!current)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChatCircleDotsIcon />
          </EmptyMedia>
          <EmptyTitle>让交流从这里开始</EmptyTitle>
          <EmptyDescription>
            选择左侧会话，分享实验想法。消息会保留，随时回来继续交流。
          </EmptyDescription>
        </EmptyHeader>
        {!guest && (
          <EmptyContent>
            <Button onClick={onCreate}>
              <PlusIcon />
              新建会话
            </Button>
          </EmptyContent>
        )}
      </Empty>
    )
  return (
    <>
      <header className="flex items-center gap-1 border-b bg-background px-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="返回会话"
          onClick={() => chat.select(null)}
        >
          <ArrowLeftIcon />
        </Button>
        <Item size="sm" className="flex-1 flex-nowrap">
          <ItemMedia>
            <ChatAvatar
              name={current.title}
              group={current.type === 'group'}
              size="lg"
            />
          </ItemMedia>
          <ItemContent className="gap-0">
            <ItemTitle>{current.title}</ItemTitle>
            <ItemDescription>
              {current.type === 'group'
                ? `${current.memberCount} 位成员`
                : '1v1 对话'}
              {guest ? ' · 示例' : ''}
            </ItemDescription>
          </ItemContent>
        </Item>
      </header>
      <MessageList
        conversationId={current.id}
        direct={current.type === 'direct'}
        userId={userId}
        messages={chat.messages}
        hasMore={chat.hasMore}
        olderLoading={chat.olderLoading}
        messageLoading={chat.messageLoading}
        onOlder={() => void chat.older()}
        onRetry={chat.retry}
        onScroll={chat.handleScroll}
        onBindScrollToEnd={chat.bindScrollToEnd}
      />
      <Composer
        guest={guest}
        draft={chat.draft}
        attached={chat.attached}
        uploading={chat.uploading}
        onDraft={chat.setDraft}
        onAttach={(file) => void chat.attach(file)}
        onRemove={chat.removeAttachment}
        onSend={chat.send}
      />
    </>
  )
}
