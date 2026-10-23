import { adminClient, anonymousClient, emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { captchaRequiredFetchOptions } from '@repo/ui/auth/lib/turnstile-plugin'
/** The base URL of the server */
export const authClient = createAuthClient({
  plugins: [adminClient(), anonymousClient(), emailOTPClient()],
  fetchOptions: captchaRequiredFetchOptions,
})
