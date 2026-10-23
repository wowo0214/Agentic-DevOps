import { ensureSessionServer } from '@better-auth-ui/core/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getQueryClient } from '@/lib/query-client'
import 'server-only'

export async function requireSession() {
  // Keep auth and TanStack Query timestamps out of prerendering.
  await connection()
  const requestHeaders = await headers()
  const queryClient = getQueryClient()
  const session = await ensureSessionServer(queryClient, auth, {
    headers: requestHeaders,
  })

  if (!session) {
    const requestedPath = requestHeaders.get('x-auth-return-to') ?? '/'
    const returnTo =
      requestedPath.startsWith('/') &&
      !requestedPath.startsWith('//') &&
      !requestedPath.includes('\\')
        ? requestedPath
        : '/'
    const query = new URLSearchParams({ redirectTo: returnTo })
    redirect(`/auth/sign-in?${query}`)
  }

  return { session, queryClient }
}
