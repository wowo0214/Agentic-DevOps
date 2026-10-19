import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard-content'
import { requireSession } from '@/lib/require-session'
export default function DashboardPage() {
  return (
    <Suspense fallback={<main aria-busy="true" />}>
      <DashboardPageContent />
    </Suspense>
  )
}

async function DashboardPageContent() {
  const { queryClient } = await requireSession()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  )
}
