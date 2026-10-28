import { notFound } from 'next/navigation'
import { cache } from 'react'
import { db } from '@/app/prisma/db'
import type { PermissionCode } from './catalog'
import 'server-only'

export class PermissionError extends Error {
  constructor(
    public status: 401 | 403,
    message: string,
  ) {
    super(message)
  }
}

type SessionUser = {
  id: string
  role?: string | null
  isAnonymous?: boolean | null
  banned?: boolean | null
}

export type Principal = {
  id: string
  role: string
  permissions: ReadonlySet<PermissionCode>
  has: (code: PermissionCode) => boolean
}

// One role per user (admin ⊃ user ⊃ guest), so there is nothing to merge. Anonymous sessions are always `guest`.
function roleOf(user: SessionUser) {
  if (user.isAnonymous === true) return 'guest'
  return user.role?.trim() || 'user'
}

// Cached per request so the sidebar and the page share one query.
const grantsFor = cache(async (role: string) => {
  const rows = await db.orm.public.rolePermission
    .where((rp) => rp.role.eq(role))
    .select('permissionCode')
    .all()
  return rows.map((row) => row.permissionCode as PermissionCode)
})

// Banned accounts resolve to an empty permission set; an unknown role has no rows and therefore no permissions.
export async function principalFor(user: SessionUser): Promise<Principal> {
  const role = roleOf(user)
  const permissions = new Set(user.banned ? [] : await grantsFor(role))
  return {
    id: user.id,
    role,
    permissions,
    has: (code) => permissions.has(code),
  }
}

export async function requirePermission(
  user: SessionUser,
  code: PermissionCode,
): Promise<void> {
  const principal = await principalFor(user)
  if (!principal.has(code)) throw new PermissionError(403, '没有权限执行此操作')
}

// For RSC pages: unauthorized visitors get a 404, same as an unknown route.
export async function requirePagePermission(
  user: SessionUser,
  code: PermissionCode,
) {
  const principal = await principalFor(user)
  if (!principal.has(code)) notFound()
  return principal
}
