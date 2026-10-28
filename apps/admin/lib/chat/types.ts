export type ChatUser = { id: string; name: string }
export type Conversation = {
  id: string
  type: 'direct' | 'group'
  title: string
  preview: string
  updatedAt: string
  unread: number
  memberCount: number
  latestId: string | null
}
export type Attachment = {
  id: string
  name: string
  type: string
  size: number
}
export type Message = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderImage: string | null
  attachments: Attachment[]
  // seq is the per-conversation order number; absent on local (unsent) and sample messages.
  content: string
  seq?: number
  createdAt: string
  clientMessageId: string
}
export type MessagePage = { messages: Message[]; hasMore: boolean }
