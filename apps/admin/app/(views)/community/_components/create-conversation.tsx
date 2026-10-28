'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Checkbox } from '@repo/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog'
import { Field, FieldError, FieldLabel } from '@repo/ui/field'
import { Input } from '@repo/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@repo/ui/input-group'
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@repo/ui/item'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/tabs'
import { request } from './chat-api'
import { ChatAvatar } from './chat-avatar'
import type { ChatUser, Conversation } from '@/lib/chat/types'

export function CreateConversation({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (conversation: Conversation) => void
}) {
  const [type, setType] = useState<'direct' | 'group'>('direct')
  const [title, setTitle] = useState('')
  const [search, setSearch] = useState('')
  const [people, setPeople] = useState<ChatUser[]>([])
  const [selected, setSelected] = useState<ChatUser[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(
      () => {
        request<ChatUser[]>(
          new URLSearchParams({ action: 'people', search }),
          controller.signal,
        )
          .then(setPeople)
          .catch((err) => {
            if (!controller.signal.aborted) setError(err.message)
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false)
          })
      },
      search ? 150 : 0,
    )
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [search])
  async function create() {
    setBusy(true)
    setError('')
    try {
      const result = await request<{ id: string }>({
        action: 'create',
        type,
        title,
        members: selected.map((user) => user.id),
      })
      onCreated({
        id: result.id,
        type,
        title: type === 'group' ? title.trim() : selected[0].name,
        preview: '',
        updatedAt: new Date().toISOString(),
        unread: 0,
        memberCount: selected.length + 1,
        latestId: null,
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>新建会话</DialogTitle>
          <DialogDescription>
            {selected.length
              ? `已选：${selected.map((user) => user.name).join('、')}`
              : '选择你想交流的对象，不区分平台角色'}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={type}
          onValueChange={(value) => {
            setType(value as 'direct' | 'group')
            setSelected([])
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="direct" disabled={busy}>
              1v1 私聊
            </TabsTrigger>
            <TabsTrigger value="group" disabled={busy}>
              创建群聊
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {type === 'group' && (
          <Field>
            <FieldLabel htmlFor="chat-title">群名称</FieldLabel>
            <Input
              id="chat-title"
              placeholder="群名称"
              maxLength={80}
              value={title}
              disabled={busy}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
        )}
        <InputGroup>
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="查找用户"
            placeholder="按姓名查找用户"
            value={search}
            disabled={busy}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <div className="max-h-60 min-h-24 overflow-y-auto">
          <ItemGroup className="gap-1">
            {people.map((user) => (
              <Item
                key={user.id}
                size="xs"
                render={<label className="cursor-pointer hover:bg-muted" />}
              >
                <Checkbox
                  disabled={busy}
                  checked={selected.some((item) => item.id === user.id)}
                  onCheckedChange={(checked) =>
                    setSelected((previous) =>
                      checked
                        ? type === 'direct'
                          ? [user]
                          : [...previous, user]
                        : previous.filter((item) => item.id !== user.id),
                    )
                  }
                />
                <ItemMedia>
                  <ChatAvatar name={user.name} size="sm" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{user.name}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
          {(loading || !people.length) && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {loading ? '正在查找…' : '没有匹配的用户'}
            </p>
          )}
        </div>
        {error && <FieldError>{error}</FieldError>}
        <DialogFooter>
          <Button
            className="w-full"
            disabled={
              busy ||
              !selected.length ||
              selected.length > 49 ||
              (type === 'group' && !title.trim())
            }
            onClick={() => void create()}
          >
            {busy ? '正在创建…' : type === 'direct' ? '开始聊天' : '创建群聊'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
