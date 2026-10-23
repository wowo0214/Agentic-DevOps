import Link from 'next/link'
import { Suspense } from 'react'
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

  return (
    <main className="mx-auto my-auto flex max-w-xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Hello, {session.user.name}</h1>
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
