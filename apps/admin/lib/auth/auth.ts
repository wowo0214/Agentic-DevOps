import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { anonymous, genericOAuth, slack } from 'better-auth/plugins'
import { admin } from 'better-auth/plugins/admin'
import { riskCaptcha } from './risk-captcha'
import { Pool } from 'pg'
import { passwordResetEmail } from '@repo/ui/emails/password-reset'
import { emailOTPWithPassword } from './email-otp'
import { emailVerification } from '@repo/ui/emails/email-verification'
import { sendEmail } from '../resend'

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY?.trim()
if (Boolean(turnstileSiteKey) !== Boolean(turnstileSecretKey)) {
  throw new Error('Configure both NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY.')
}

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  // Better Auth 1.7.11 detects pg.Pool and enables real transactions.
  database,
  rateLimit: { enabled: true },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
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

  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
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
    riskCaptcha({
      secretKey: turnstileSecretKey,
      expectedAction: 'auth',
      endpoints: [
        '/sign-up/email',
        '/sign-in/email',
        '/request-password-reset',
        '/sign-up/email-otp',
        '/sign-in/email-otp',
        '/email-otp/send-verification-otp',
        '/email-otp/verify-email',
        '/send-verification-email',
      ],
    }),
    emailOTPWithPassword({
      sendVerificationOTP: async ({ email, otp }) => {
        await sendEmail({ to: email, ...emailVerification({ otp }) })
      },
    }),
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
