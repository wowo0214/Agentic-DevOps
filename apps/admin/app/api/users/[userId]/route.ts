import { db } from '@/app/prisma/db'
import { auth } from '@/lib/auth/auth'
import { PermissionError, requirePermission } from '@/lib/permissions/server'
import { R } from '@repo/http-contract'

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return R.error('请先登录', 401)
    await requirePermission(session.user, 'user:role:update')

    const user = await db.orm.public.user
      .where((u) => u.email.eq('admin@next.com'))
      .select('id', 'name', 'role')
      .update({ role: 'admin' })

    if (!user) {
      return R.error('User not found', 404)
    }
    return R.ok(user, 'User updated')
  } catch (error) {
    if (error instanceof PermissionError)
      return R.error(error.message, error.status)
    // The query or update failed.
    console.error(error)

    return R.error('Failed to update the user role')
  }
}
