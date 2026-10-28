'use client'

import { useState } from 'react'
import { Alert, AlertAction, AlertDescription } from '@repo/ui/alert'
import { Button } from '@repo/ui/button'
import { ChatPane } from './chat-pane'
import { ConversationList } from './conversation-list'
import { CreateConversation } from './create-conversation'
import { useChat } from './use-chat'

// Community page: conversation list on the left, the open conversation on the right.
export function ChatWorkspace({
  userId,
  userName,
  userImage,
  guest,
}: {
  userId: string
  userName: string
  userImage: string | null
  guest: boolean
}) {
  const chat = useChat({ userId, userName, userImage, guest })
  const [creating, setCreating] = useState(false)
  return (
    <div className="relative flex h-[calc(100dvh-3rem)] min-h-96 overflow-hidden border-t bg-background">
      <ConversationList
        conversations={chat.conversations}
        selectedId={chat.selectedId}
        loading={chat.loading}
        online={chat.online}
        guest={guest}
        onSelect={chat.select}
        onCreate={() => setCreating(true)}
      />
      <section
        className={`${chat.selectedId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-[#dfe9d6] dark:bg-[#0f0f0f]`}
      >
        <ChatPane
          chat={chat}
          userId={userId}
          guest={guest}
          onCreate={() => setCreating(true)}
        />
        {chat.error && (
          <Alert
            variant="destructive"
            className="rounded-none border-x-0 border-b-0"
          >
            <AlertDescription>{chat.error}</AlertDescription>
            <AlertAction>
              <Button variant="ghost" size="sm" onClick={chat.reload}>
                重新加载
              </Button>
            </AlertAction>
          </Alert>
        )}
      </section>
      {!chat.selectedId && chat.error && (
        <Alert
          variant="destructive"
          className="absolute bottom-4 left-4 right-4 w-auto md:hidden"
        >
          <AlertDescription>{chat.error}</AlertDescription>
        </Alert>
      )}
      {creating && (
        <CreateConversation
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setCreating(false)
            chat.open(created)
          }}
        />
      )}
    </div>
  )
}
