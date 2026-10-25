import Link from 'next/link'
import { Suspense } from 'react'
import { requirePagePermission } from '@/lib/permissions/server'
import { requireSession } from '@/lib/require-session'

export default function DashboardPage() {
  return (
    <Suspense fallback={<main aria-busy="true" />}>
      <DashboardPageContent />
    </Suspense>
  )
}

async function DashboardPageContent() {
  const { session } = await requireSession()
  await requirePagePermission(session.user, 'dashboard:read')

  return (
    <main className="mx-auto my-auto flex max-w-xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">工作台</h1>
      <p>你好，{session.user.name}</p>
      <p className="text-muted-foreground">Signed in as {session.user.email}</p>

      <Link href="/settings/account" className="underline">
        Account settings
      </Link>
      <Link href="/settings/security" className="underline">
        Security settings
      </Link>
      <Link href="/auth/sign-out" className="underline">
        Sign out
      </Link>
    </main>
  )
}
