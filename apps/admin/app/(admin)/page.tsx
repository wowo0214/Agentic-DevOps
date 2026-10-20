import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard-content'
import { requireSession } from '@/lib/require-session'

export default function Page() {
  return (
    <Suspense fallback={<main aria-busy="true" />}>
      <Workspace />
    </Suspense>
  )
}

async function Workspace() {
  const { queryClient } = await requireSession()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  )
}
