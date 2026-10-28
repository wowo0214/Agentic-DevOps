'use client'

import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Empty, EmptyDescription } from '@repo/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@repo/ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@repo/ui/item'
import { ChatAvatar } from './chat-avatar'
import { time } from './format'
import type { Conversation } from '@/lib/chat/types'

// Left column: connection status, new-conversation button, search and the conversation rows.
export function ConversationList({
  conversations,
  selectedId,
  loading,
  online,
  guest,
  onSelect,
  onCreate,
}: {
  conversations: Conversation[]
  selectedId: string | null
  loading: boolean
  online: boolean
  guest: boolean
  onSelect: (id: string) => void
  onCreate: () => void
}) {
  const [search, setSearch] = useState('')
  const matches = conversations.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <aside
      className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r md:w-72 xl:w-80`}
    >
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">社群</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {guest
              ? '只读示例 · 探索交流空间'
              : online
                ? '已连接 · 保留每一次交流'
                : '正在连接，断线消息会自动补收'}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="新建会话"
          disabled={guest}
          onClick={onCreate}
        >
          <PlusIcon />
        </Button>
      </div>
      <div className="px-4 pb-3">
        <InputGroup className="h-10 rounded-full border-0 bg-muted">
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="搜索会话"
            placeholder="搜索会话"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <ItemGroup className="gap-0.5">
          {matches.map((item) => (
            <Item
              key={item.id}
              size="sm"
              render={<button type="button" />}
              aria-current={selectedId === item.id}
              className="gap-3 rounded-2xl p-2 text-left hover:bg-muted aria-[current=true]:bg-[#3390ec] aria-[current=true]:text-white aria-[current=true]:hover:bg-[#3390ec]"
              onClick={() => onSelect(item.id)}
            >
              <ItemMedia>
                <ChatAvatar
                  name={item.title}
                  group={item.type === 'group'}
                  size="xl"
                />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="text-base">{item.title}</ItemTitle>
                <ItemDescription className="truncate group-aria-[current=true]/item:text-white/80">
                  {item.preview || '开始第一条消息'}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="flex-col items-end gap-1.5">
                <time className="text-xs text-muted-foreground group-aria-[current=true]/item:text-white/80">
                  {time(item.updatedAt)}
                </time>
                {item.unread > 0 && (
                  <Badge className="h-5 min-w-5 rounded-full bg-[#3390ec] px-1.5 text-white group-aria-[current=true]/item:bg-white group-aria-[current=true]/item:text-[#3390ec]">
                    {item.unread > 99 ? '99+' : item.unread}
                  </Badge>
                )}
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
        {!matches.length && (
          <Empty>
            <EmptyDescription>
              {loading
                ? '正在加载会话…'
                : conversations.length
                  ? '没有匹配的会话'
                  : '还没有会话，点击右上角 + 开始交流。'}
            </EmptyDescription>
          </Empty>
        )}
      </div>
      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        {guest
          ? '示例消息不会写入真实会话'
          : '私聊与群聊 · 消息安全保存在服务端'}
      </div>
    </aside>
  )
}
