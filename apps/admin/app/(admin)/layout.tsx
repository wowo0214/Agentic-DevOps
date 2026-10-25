import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { SidebarProvider, SidebarTrigger } from '@repo/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarNavigation } from '@/components/sidebar/sidebar-navigation'
import { requireSession } from '@/lib/require-session'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main aria-busy="true" />}>
      <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
    </Suspense>
  )
}

async function AuthenticatedAdminLayout({ children }: { children: ReactNode }) {
  const { queryClient, session } = await requireSession()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar navigation={<SidebarNavigation user={session.user} />} />
        <main className="min-w-0 flex-1">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </HydrationBoundary>
  )
}
