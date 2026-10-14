import { ensureSessionServer } from '@better-auth-ui/core/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard-content'
import { auth } from '@/lib/auth'
import { getQueryClient } from '@/lib/query-client'
import { Header } from '@/components/header';
export default function DashboardPage() {
  return (
    <Suspense fallback={<main aria-busy="true" />}>
      <Header />
      <DashboardPageContent />
    </Suspense>
  )
}

async function DashboardPageContent() {
  const queryClient = getQueryClient()
  const session = await ensureSessionServer(queryClient, auth, {
    headers: await headers(),
  })
  if (!session) redirect('/auth/sign-in?redirectTo=/dashboard')

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  )
}
