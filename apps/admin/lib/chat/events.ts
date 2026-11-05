import { createClient } from 'redis'
import type { Message } from './types'
import 'server-only'

// Chat change events over Redis Pub/Sub; Postgres is the source of truth, missed events are recovered by the client's seq/after cursor.

type Client = Awaited<ReturnType<typeof connect>>

// Connections live on globalThis so dev hot reloads reuse them.
const state = globalThis as {
  __chatPublisher?: Promise<Client>
  __chatSubscriber?: Promise<Client>
}

const channelOf = (userId: string) => `chat:user:${userId}`
async function connect() {
  const client = createClient({ url: process.env.REDIS_URL })
  client.on('error', (error) => console.error('Chat redis error', error))
  await client.connect()
  return client
}

// A subscribed connection cannot run other commands, so subscribing uses its own client.
const getPublisher = () => (state.__chatPublisher ??= connect())
const getSubscriber = () => (state.__chatSubscriber ??= connect())

// Notify these users that chat data changed; a new message rides along so receivers skip the database.
export async function publishChatEvent(userIds: string[], message?: Message) {
  const payload = message ? JSON.stringify({ message }) : ''
  const publisher = await getPublisher()
  await Promise.all(
    userIds.map((id) => publisher.publish(channelOf(id), payload)),
  )
}

type Listener = (payload: string) => void

// Calls listener for this user's chat events; returns an unsubscribe function.
export async function subscribeChatEvents(userId: string, listener: Listener) {
  const subscriber = await getSubscriber()
  await subscriber.subscribe(channelOf(userId), listener)
  return () =>
    subscriber.unsubscribe(channelOf(userId), listener).catch(() => {})
}
