import 'server-only'

import { RowsIcon, RobotIcon, WaveformIcon, CommandIcon, BookOpenIcon, GearIcon, UsersThreeIcon } from '@phosphor-icons/react/ssr'
import type { PermissionCode } from '@/lib/permissions/catalog'
import { principalFor } from '@/lib/permissions/server'
import { NavMain } from './nav-main'

// Every entry names the permission that shows it; the page behind it still enforces the same permission on the server.
// 个人设置 has no entry here: every signed-in account owns its own settings.
const userItems = [
  { title: '工作台', url: '/dashboard', icon: <RowsIcon />, permission: 'dashboard:read' },
  { title: '自定义模块', url: '/modules', icon: <RobotIcon />, permission: 'module:read' },
  { title: '测试', url: '/tests', icon: <WaveformIcon />, permission: 'test:read' },
  { title: '实验管理', url: '/experiments', icon: <CommandIcon />, permission: 'experiment:read' },
  { title: '公共资源', url: '/public-resources', icon: <BookOpenIcon />, permission: 'public-resource:read' },
  { title: '发布管理', url: '/publications', icon: <RowsIcon />, permission: 'publication:read' },
  { title: '社群', url: '/community', icon: <UsersThreeIcon />, permission: 'conversation:read' },
  { title: '个人设置', url: '/settings/account', icon: <GearIcon /> },
] satisfies NavEntry[]

const adminItems = [
  { title: '维护管理', url: '/maintenance', icon: <GearIcon />, permission: 'maintenance:read' },
  { title: '管理员管理', url: '/users', icon: <UsersThreeIcon />, permission: 'user:read' },
  { title: '内容管理', url: '/content', icon: <RowsIcon />, permission: 'content:read' },
  { title: '文档管理', url: '/docs', icon: <BookOpenIcon />, permission: 'doc:read' },
  { title: '运行监控', url: '/monitoring', icon: <WaveformIcon />, permission: 'monitoring:read' },
  { title: '日志管理', url: '/logs', icon: <RowsIcon />, permission: 'log:read' },
] satisfies NavEntry[]

type NavEntry = { title: string; url: string; icon: React.ReactNode; permission?: PermissionCode }

export async function SidebarNavigation({ user }: {
  user: { id: string; role?: string | null; isAnonymous?: boolean | null; banned?: boolean | null }
}) {
  const principal = await principalFor(user)
  const visible = (items: NavEntry[]) =>
    items.filter((item) => !item.permission || principal.has(item.permission)).map(({ permission: _permission, ...item }) => item)
  const workspace = visible(userItems)
  const platform = visible(adminItems)

  return (
    <>
      {workspace.length > 0 && <NavMain label="工作空间" items={workspace} />}
      {platform.length > 0 && <NavMain label="平台管理" items={platform} />}
    </>
  )
}
