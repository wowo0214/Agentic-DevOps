import { anonymousClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
/** The base URL of the server */
export const authClient = createAuthClient({
  plugins: [anonymousClient()],
})
