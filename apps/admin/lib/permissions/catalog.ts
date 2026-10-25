// Source of truth for permission codes and the default role grants.
// `bun scripts/sync-permissions.ts` upserts this into permission / role_permission; runtime checks only read the database.

export const PERMISSIONS = {
  'dashboard:read': '查看工作台',
  'module:read': '查看自定义模块',
  'test:read': '查看测试',
  'experiment:read': '查看实验管理',
  'public-resource:read': '查看公共资源',
  'publication:read': '查看发布管理',
  'conversation:read': '查看自己的会话与消息',
  'conversation:create': '创建私聊、群聊',
  'message:send': '发送消息',
  'conversation:mark-read': '更新自己的已读进度',
  'community:user:search': '搜索交流对象',
  'maintenance:read': '查看维护管理',
  'user:read': '查看用户账号',
  'user:role:update': '修改用户角色',
  'content:read': '查看内容管理',
  'doc:read': '查看文档管理',
  'monitoring:read': '查看运行监控',
  'log:read': '查看日志管理',
} as const

export type PermissionCode = keyof typeof PERMISSIONS

const guestGrants = [
  'dashboard:read', 'module:read', 'test:read', 'experiment:read',
  'public-resource:read', 'publication:read', 'conversation:read',
] as const satisfies readonly PermissionCode[]

const userGrants = [
  ...guestGrants,
  'conversation:create', 'message:send', 'conversation:mark-read', 'community:user:search',
] as const satisfies readonly PermissionCode[]

// admin has no implicit bypass: every code it may use is listed here.
const adminGrants = [
  ...userGrants,
  'maintenance:read', 'user:read', 'user:role:update', 'content:read', 'doc:read', 'monitoring:read', 'log:read',
] as const satisfies readonly PermissionCode[]

export const ROLE_PERMISSIONS: Record<string, readonly PermissionCode[]> = {
  guest: guestGrants,
  user: userGrants,
  admin: adminGrants,
}
