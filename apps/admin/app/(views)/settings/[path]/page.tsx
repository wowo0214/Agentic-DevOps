import { viewPaths } from '@better-auth-ui/core'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { requireSession } from '@/lib/require-session'
import { Settings } from '@repo/ui/auth'

const validSettingsPaths = new Set(Object.values(viewPaths.settings))

export default function SettingsPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  return (
    <Suspense
      fallback={
        <main
          className="mx-auto w-full max-w-3xl p-4 md:p-6"
          aria-busy="true"
        />
      }
    >
      <SettingsPageContent params={params} />
    </Suspense>
  )
}

async function SettingsPageContent({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params
  if (!validSettingsPaths.has(path)) notFound()

  const { queryClient } = await requireSession()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Settings path={path} />
      </main>
    </HydrationBoundary>
  )
}
