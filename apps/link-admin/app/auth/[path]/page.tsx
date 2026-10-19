import { viewPaths } from '@better-auth-ui/core'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Auth } from '@repo/ui/auth'

const validAuthPaths = new Set(Object.values(viewPaths.auth))

export default function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  return (
    <Suspense
      fallback={
        <main
          className="flex min-h-svh w-full items-center justify-center p-4 md:p-6"
          aria-busy="true"
        />
      }
    >
      <AuthPageContent params={params} />
    </Suspense>
  )
}

async function AuthPageContent({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params
  if (!validAuthPaths.has(path)) notFound()

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-4 md:p-6">
      <Auth path={path} />
    </main>
  )
}
