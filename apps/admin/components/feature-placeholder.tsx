import type { PermissionCode } from '@/lib/permissions/catalog'
import { requirePagePermission } from '@/lib/permissions/server'
import { requireSession } from '@/lib/require-session'

export async function FeaturePlaceholder({ title, permission }: { title: string; permission: PermissionCode }) {
  const { session } = await requireSession()
  await requirePagePermission(session.user, permission)

  return (
    <section className="w-full p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6 flex min-h-64 items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6">
        <p className="text-sm text-muted-foreground">功能待完善</p>
      </div>
    </section>
  )
}
