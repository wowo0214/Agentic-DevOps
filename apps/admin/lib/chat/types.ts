export type ChatUser = { id: string; name: string }
export type Conversation = {
  id: string; type: 'direct' | 'group'; title: string; preview: string
  updatedAt: string; unread: number; memberCount: number; latestId: string | null
}
export type Message = {
  id: string; conversationId: string; senderId: string; senderName: string
  content: string; createdAt: string; clientMessageId: string
}
export type MessagePage = { messages: Message[]; hasMore: boolean }
