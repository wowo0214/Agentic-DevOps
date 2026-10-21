import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { genericOAuth, slack, anonymous } from 'better-auth/plugins'
import { admin } from 'better-auth/plugins/admin'
import { Pool } from 'pg'
import { passwordResetEmail } from '@repo/ui/emails/password-reset'
import { sendEmail } from './resend'
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // use password-reset card to show info
      const email = passwordResetEmail({
        name: user.name,
        resetUrl: url,
      })

      await sendEmail({
        to: user.email,
        ...email,
      })
    },
    // The callback to execute logic after a password has been successfully reset
    // When revokeSessionsOnPasswordReset is enabled, it also runs after the user's sessions are revoked
    // onPasswordReset: async ({ user }, request) => {
    //   // your logic here
    // },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin(),
    anonymous(),
    genericOAuth({
      config: [
        slack({
          clientId: process.env.SLACK_CLIENT_ID as string,
          clientSecret: process.env.SLACK_CLIENT_SECRET as string,
        }),
      ],
    }),
    nextCookies(),
  ],
})
