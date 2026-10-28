import { redis, type RedisClient } from 'bun'
import type { Message } from './types'
import 'server-only'

// Chat change events over Redis Pub/Sub; Postgres is the source of truth, missed events are recovered by the client's seq/after cursor.

// Event body: {"message": Message} for a new message, '' when only counts changed.
type Listener = (payload: string) => void

// The subscriber lives on globalThis so dev hot reloads reuse it.
const state = globalThis as { __chatSubscriber?: Promise<RedisClient> }

const channelOf = (userId: string) => `chat:user:${userId}`

// A subscribed connection cannot run other commands, so use a duplicate of the default client.
function getSubscriber() {
  state.__chatSubscriber ??= redis.duplicate()
  return state.__chatSubscriber
}

// Notify these users that chat data changed; a new message rides along so receivers skip the database.
export async function publishChatEvent(userIds: string[], message?: Message) {
  const payload = message ? JSON.stringify({ message }) : ''
  await Promise.all(userIds.map((id) => redis.publish(channelOf(id), payload)))
}

// Calls onEvent for this user's chat events; returns an unsubscribe function.
export async function subscribeChatEvents(userId: string, onEvent: Listener) {
  const subscriber = await getSubscriber()
  await subscriber.subscribe(channelOf(userId), onEvent)
  return () =>
    subscriber.unsubscribe(channelOf(userId), onEvent).catch(() => {})
}
