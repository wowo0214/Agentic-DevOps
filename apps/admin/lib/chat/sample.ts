import type { Conversation, Message } from './types'

export const sampleConversations: Conversation[] = [
  {
    id: 'sample-group',
    type: 'group',
    title: '实验交流小组',
    preview: '大家可以在这里交流实验设计。',
    updatedAt: '2026-10-24T09:02:00Z',
    unread: 0,
    memberCount: 3,
    latestId: 'sample-2',
  },
  {
    id: 'sample-direct',
    type: 'direct',
    title: '林老师',
    preview: '欢迎体验社群，有想法可以在正式账号中交流。',
    updatedAt: '2026-10-24T08:00:00Z',
    unread: 0,
    memberCount: 2,
    latestId: 'sample-3',
  },
]
export const sampleMessages: Message[] = [
  {
    id: 'sample-1',
    conversationId: 'sample-group',
    senderId: 'sample-lin',
    senderName: '林老师',
    senderImage: null,
    attachments: [],
    content: '欢迎来到实验交流小组 👋',
    createdAt: '2026-10-24T09:00:00Z',
    clientMessageId: 'sample-1',
  },
  {
    id: 'sample-2',
    conversationId: 'sample-group',
    senderId: 'sample-chen',
    senderName: '陈老师',
    senderImage: null,
    attachments: [],
    content:
      '大家可以在这里交流实验设计。\n群聊和私聊的消息都会保留，离线后回来也可以继续阅读。',
    createdAt: '2026-10-24T09:02:00Z',
    clientMessageId: 'sample-2',
  },
  {
    id: 'sample-3',
    conversationId: 'sample-direct',
    senderId: 'sample-lin',
    senderName: '林老师',
    senderImage: null,
    attachments: [],
    content: '欢迎体验社群，有想法可以在正式账号中交流。',
    createdAt: '2026-10-24T08:00:00Z',
    clientMessageId: 'sample-3',
  },
]
