'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { getQueryClient } from '@/lib/query-client'
import { AuthProvider, themePlugin, turnstilePlugin } from '@repo/ui/auth'
import { anonymousPlugin } from '@repo/ui/lib/auth/anonymous-plugin'
import { Toaster } from '@repo/ui/sonner'
import type { Route } from 'next'
import type { ComponentProps, ReactNode } from 'react'

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
const captchaPlugins = turnstileSiteKey ? [turnstilePlugin(turnstileSiteKey)] : []

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
            requireEmailVerification: true,
            rememberMe: true,
          }}
          navigate={({ to, replace }) =>
            replace ? router.replace(to as Route) : router.push(to as Route)
          }
          plugins={[
            themePlugin({ useTheme }),
            anonymousPlugin(),
            ...captchaPlugins,
          ]}
          Link={Link as ComponentProps<typeof AuthProvider>['Link']}
        >
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
