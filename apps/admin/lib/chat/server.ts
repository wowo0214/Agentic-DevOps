import 'server-only'
import { randomUUID } from 'node:crypto'
import { auth, database } from '@/lib/auth/auth'
import type { PermissionCode } from '@/lib/permissions/catalog'
import { principalFor, type Principal } from '@/lib/permissions/server'
import type { Conversation, Message } from './types'

export class ChatError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function chatIdentity(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new ChatError(401, '请先登录')
  if (session.user.banned) throw new ChatError(403, '账号不可用')
  return principalFor(session.user)
}

// Layer 2 of the chat checks: does the user's role allow this kind of operation? (Layer 3 is conversation membership.)
export function allow(user: Principal, code: PermissionCode) {
  if (!user.has(code)) throw new ChatError(403, user.guest ? '体验账号只能阅读示例消息' : '没有权限执行此操作')
}

export function writeAccess(request: Request) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  const expectedOrigin = `${url.protocol}//${request.headers.get('host')}`
  if (origin !== expectedOrigin) {
    throw new ChatError(403, '请求来源无效')
  }
}

export function text(value: unknown, max = 5000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ChatError(400, '输入内容为空或过长')
  return value.trim()
}

export function chatResponse(error: unknown) {
  if (error instanceof ChatError) return Response.json({ error: error.message }, { status: error.status })
  if (error instanceof SyntaxError) return Response.json({ error: '请求格式不正确' }, { status: 400 })
  console.error('Chat request failed', error)
  return Response.json({ error: '暂时无法完成操作，请稍后重试' }, { status: 500 })
}

export async function requireMember(userId: string, conversationId: string) {
  const result = await database.query('SELECT 1 FROM conversation_member WHERE conversation_id = $1 AND user_id = $2', [conversationId, userId])
  if (!result.rowCount) throw new ChatError(404, '会话不存在或不可访问')
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  const { rows } = await database.query(`
    SELECT c.id, c.type,
      COALESCE(c.title, (SELECT u.name FROM conversation_member cm JOIN "user" u ON u.id = cm.user_id
        WHERE cm.conversation_id = c.id AND cm.user_id <> $1 LIMIT 1), '私聊') AS title,
      COALESCE(latest.content, '') AS preview, COALESCE(latest.created_at, c.created_at)::text AS "updatedAt",
      latest.id AS "latestId",
      (SELECT count(*)::int FROM conversation_member cm WHERE cm.conversation_id = c.id) AS "memberCount",
      (SELECT count(*)::int FROM message msg WHERE msg.conversation_id = c.id AND msg.sender_id <> $1
        AND (seen.id IS NULL OR msg.seq > seen.seq)) AS unread
    FROM conversation_member mine JOIN conversation c ON c.id = mine.conversation_id
    LEFT JOIN message seen ON seen.id = mine.last_read_message_id
    LEFT JOIN message latest ON latest.conversation_id = c.id AND latest.seq = c.last_seq
    WHERE mine.user_id = $1 ORDER BY COALESCE(latest.created_at, c.created_at) DESC, c.id`, [userId])
  return rows
}

export async function findPeople(userId: string, search: string) {
  const { rows } = await database.query(`SELECT id, name FROM "user" WHERE id <> $1
    AND COALESCE("isAnonymous", false) = false AND COALESCE(banned, false) = false
    AND COALESCE(role, 'user') <> 'guest' AND name ILIKE $2 ORDER BY name, id LIMIT 30`, [userId, `%${search.slice(0, 80)}%`])
  return rows
}

export async function createConversation(userId: string, body: Record<string, unknown>) {
  const type = body.type
  if (type !== 'direct' && type !== 'group') throw new ChatError(400, '请选择会话类型')
  if (!Array.isArray(body.members) || body.members.some((id) => typeof id !== 'string' || id.length > 200)) throw new ChatError(400, '成员无效')
  const others = [...new Set(body.members as string[])].filter((id) => id !== userId)
  if (!others.length || others.length > 49 || (type === 'direct' && others.length !== 1)) throw new ChatError(400, '私聊选择 1 人，群聊选择 1–49 人')
  const title = type === 'group' ? text(body.title, 80) : null
  const members = [userId, ...others].sort()
  const directKey = type === 'direct' ? JSON.stringify(members) : null
  // One statement, no transaction: member validity, conversation and member rows are all written together or not at all.
  const result = await database.query(`WITH valid AS (SELECT id FROM "user" WHERE id = ANY($6::text[]) AND COALESCE("isAnonymous", false) = false
        AND COALESCE(banned, false) = false AND COALESCE(role, 'user') <> 'guest' FOR SHARE),
      c AS (INSERT INTO conversation (id, type, title, created_by, direct_key)
        SELECT $1, $2, $3, $4, $5 WHERE (SELECT count(*) FROM valid) = $7::int
        ON CONFLICT (direct_key) DO UPDATE SET direct_key = EXCLUDED.direct_key RETURNING id),
      m AS (INSERT INTO conversation_member (conversation_id, user_id, member_role)
        SELECT c.id, u, CASE WHEN $2 = 'group' AND u = $4 THEN 'owner' ELSE 'member' END FROM c, unnest($6::text[]) AS u
        ON CONFLICT DO NOTHING)
      SELECT id FROM c`, [randomUUID(), type, title, userId, directKey, members, members.length])
  if (!result.rowCount) throw new ChatError(400, '有成员不可用，请重新选择')
  return { id: result.rows[0].id as string }
}

const messageColumns = `m.id, m.conversation_id AS "conversationId", m.sender_id AS "senderId", u.name AS "senderName",
  m.content, m.created_at::text AS "createdAt", m.client_message_id AS "clientMessageId"`

export async function listMessages(userId: string, id: string, cursor: string | null, after: boolean) {
  const direction = after ? 'ASC' : 'DESC'
  const comparison = after ? '>' : '<'
  // Membership is checked inside the same query; the extra validation below only runs on an empty page.
  const { rows } = await database.query<Message>(`SELECT ${messageColumns} FROM message m JOIN "user" u ON u.id = m.sender_id
    WHERE m.conversation_id = $1 AND EXISTS (SELECT 1 FROM conversation_member WHERE conversation_id = $1 AND user_id = $2)
    ${cursor ? `AND m.seq ${comparison} (SELECT seq FROM message WHERE id = $3 AND conversation_id = $1)` : ''}
    ORDER BY m.seq ${direction} LIMIT 51`, cursor ? [id, userId, cursor] : [id, userId])
  if (!rows.length) {
    await requireMember(userId, id)
    if (cursor) {
      const exists = await database.query('SELECT 1 FROM message WHERE id = $1 AND conversation_id = $2', [cursor, id])
      if (!exists.rowCount) throw new ChatError(400, '消息游标无效')
    }
  }
  const messages = rows.slice(0, 50)
  return { messages: after ? messages : messages.reverse(), hasMore: rows.length > 50 }
}

export async function sendMessage(userId: string, id: string, body: Record<string, unknown>) {
  const content = text(body.content)
  const clientId = text(body.clientMessageId, 100)
  // One statement, one round trip. The UPDATE row-locks the conversation and hands out the next per-conversation seq,
  // so seq order equals commit order. A retry of the same clientMessageId finds the stored row instead.
  const run = () => database.query<Message & { dup: boolean; storedContent: string }>(`
    WITH ex AS (SELECT id, content FROM message WHERE conversation_id = $1 AND sender_id = $2 AND client_message_id = $4),
    bump AS (UPDATE conversation c SET last_seq = c.last_seq + 1
      WHERE c.id = $1 AND NOT EXISTS (SELECT 1 FROM ex)
        AND EXISTS (SELECT 1 FROM conversation_member WHERE conversation_id = $1 AND user_id = $2)
      RETURNING c.last_seq),
    ins AS (INSERT INTO message (id, conversation_id, sender_id, client_message_id, content, seq, created_at)
      SELECT $3, $1, $2, $4, $5, last_seq, clock_timestamp() FROM bump RETURNING *)
    SELECT ${messageColumns}, false AS dup, m.content AS "storedContent" FROM ins m JOIN "user" u ON u.id = m.sender_id
    UNION ALL
    SELECT ${messageColumns}, true, m.content FROM message m JOIN "user" u ON u.id = m.sender_id WHERE m.id = (SELECT id FROM ex)`,
    [id, userId, randomUUID(), clientId, content])
  let result
  try { result = await run() } catch (error) {
    // Same clientMessageId raced itself: the other insert has committed, so a second pass reads it back.
    if ((error as { code?: string }).code !== '23505') throw error
    result = await run()
  }
  const row = result.rows[0]
  if (!row) throw new ChatError(404, '会话不存在或不可访问')
  if (row.dup && row.storedContent !== content) throw new ChatError(409, '重复发送标识与原消息不一致')
  const { dup: _dup, storedContent: _stored, ...message } = row
  return message as Message
}

export async function markRead(userId: string, id: string, messageId: string) {
  // The UPDATE only matches the caller's own membership row, so no separate membership check is needed.
  await database.query(`UPDATE conversation_member cm SET last_read_message_id = target.id FROM message target
    WHERE cm.conversation_id=$1 AND cm.user_id=$2 AND target.id=$3 AND target.conversation_id=$1
    AND (cm.last_read_message_id IS NULL OR target.seq >
      (SELECT seq FROM message WHERE id=cm.last_read_message_id))`, [id, userId, messageId])
  return { ok: true }
}
