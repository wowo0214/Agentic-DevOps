import { headers } from 'next/headers'
import { Suspense } from 'react'
import {
  UserTable,
  type User,
} from '@/app/(views)/users/_components/user-table'
import { auth } from '@/lib/auth/auth'
import { requirePagePermission } from '@/lib/permissions/server'
import { requireSession } from '@/lib/require-session'

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageFallback />}>
      <UsersPageContent />
    </Suspense>
  )
}

function UsersPageFallback() {
  return (
    <div className="w-full p-4 md:p-6" aria-busy="true">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-64 animate-pulse rounded-lg border bg-muted/30" />
    </div>
  )
}

async function UsersPageContent() {
  const { session } = await requireSession()

  await requirePagePermission(session.user, 'user:read')

  const requestHeaders = await headers()
  const pageSize = 100
  const firstPage = await auth.api.listUsers({
    headers: requestHeaders,
    query: {
      limit: pageSize,
      offset: 0,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
  })
  const userRecords = [...firstPage.users]

  for (let offset = pageSize; offset < firstPage.total; offset += pageSize) {
    const page = await auth.api.listUsers({
      headers: requestHeaders,
      query: {
        limit: pageSize,
        offset,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
    })
    userRecords.push(...page.users)
  }

  const users: User[] = userRecords
    .filter((user) => !('isAnonymous' in user && user.isAnonymous === true))
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? null,
      banned: user.banned ?? false,
      banReason: user.banReason ?? null,
      banExpires:
        user.banExpires instanceof Date
          ? user.banExpires.toISOString()
          : user.banExpires
            ? String(user.banExpires)
            : null,
    }))

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">管理员管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查看用户账号及封禁状态，每页显示 20 位用户。
        </p>
      </div>
      <UserTable users={users} />
    </div>
  )
}
