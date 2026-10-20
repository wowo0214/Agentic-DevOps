import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { SidebarProvider, SidebarTrigger } from '@repo/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { requireSession } from '@/lib/require-session'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main aria-busy="true" />}>
      <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
    </Suspense>
  )
}

async function AuthenticatedAdminLayout({ children }: { children: ReactNode }) {
  const { queryClient } = await requireSession()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </HydrationBoundary>
  )
}
