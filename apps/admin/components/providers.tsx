'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { getQueryClient } from '@/lib/query-client'
import { AuthProvider, themePlugin } from '@repo/ui/auth'
import { anonymousPlugin } from '@repo/ui/lib/auth/anonymous-plugin'
import { Toaster } from '@repo/ui/sonner'
import type { Route } from 'next'
import type { ComponentProps, ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  // 'wechat', 'apple'
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={getQueryClient()}>
        <AuthProvider
          authClient={authClient}
          // The url to redirect to successful sign-in
          redirectTo="/"
          socialProviders={['google', 'github', 'slack']}
          emailAndPassword={{
            requireEmailVerification: false,
            rememberMe: true,
          }}
          navigate={({ to, replace }) =>
            replace ? router.replace(to as Route) : router.push(to as Route)
          }
          plugins={[themePlugin({ useTheme }), anonymousPlugin()]}
          Link={Link as ComponentProps<typeof AuthProvider>['Link']}
        >
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
