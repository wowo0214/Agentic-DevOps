import { APIError, createAuthMiddleware } from 'better-auth/api'
import type { BetterAuthPlugin } from 'better-auth'

export const CAPTCHA_REQUIRED = 'CAPTCHA_REQUIRED'

export type RiskCaptchaOptions = {
  /** Without a key the plugin stays inert, which keeps the plugin list a fixed tuple for type inference. */
  secretKey?: string
  /** Paths (without base path) that may demand a challenge. */
  endpoints: string[]
  expectedAction?: string
  /** Failed attempts per client within `windowMs` before a challenge is demanded. */
  maxFailures?: number
  /** Total requests per client within `windowMs` before a challenge is demanded. */
  maxRequests?: number
  windowMs?: number
}

type Bucket = { requests: number; failures: number; resetAt: number }

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

function clientKey(headers: Headers | undefined) {
  const ip =
    headers?.get('cf-connecting-ip') ??
    headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers?.get('x-real-ip') ??
    'unknown'
  return ip
}

/**
 * Risk-based Turnstile: requests pass untouched until a client looks abusive
 * (repeated failures or a burst of requests). Then the endpoint answers
 * `CAPTCHA_REQUIRED` and the client must retry with an `x-captcha-response` token.
 * A valid token clears the client's risk counters.
 *
 * Counters are per-process memory; on multi-instance/serverless deployments each
 * instance counts separately, which only makes the challenge trigger later.
 */
export function riskCaptcha({
  secretKey,
  endpoints,
  expectedAction,
  maxFailures = 3,
  maxRequests = 10,
  windowMs = 10 * 60 * 1000,
}: RiskCaptchaOptions) {
  const buckets = new Map<string, Bucket>()

  function bucket(key: string) {
    const now = Date.now()
    let entry = buckets.get(key)
    if (!entry || entry.resetAt <= now) {
      entry = { requests: 0, failures: 0, resetAt: now + windowMs }
      buckets.set(key, entry)
      if (buckets.size > 10_000) {
        for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
      }
    }
    return entry
  }

  const matches = (path: string | undefined) =>
    !!secretKey && !!path && endpoints.includes(path)

  async function verify(token: string, ip: string) {
    const body = new URLSearchParams({
      secret: secretKey ?? '',
      response: token,
    })
    if (ip !== 'unknown') body.set('remoteip', ip)
    try {
      const res = await fetch(SITEVERIFY, { method: 'POST', body })
      const data = (await res.json()) as { success?: boolean; action?: string }
      if (!data.success) return false
      return !expectedAction || !data.action || data.action === expectedAction
    } catch {
      return false
    }
  }

  return {
    id: 'risk-captcha' as const,
    hooks: {
      before: [
        {
          matcher: (ctx) => matches(ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const key = clientKey(ctx.headers)
            const entry = bucket(key)
            const token = ctx.headers?.get('x-captcha-response')

            if (token) {
              if (!(await verify(token, key))) {
                throw new APIError('FORBIDDEN', {
                  code: CAPTCHA_REQUIRED,
                  message:
                    'Verification failed. Please complete the check and try again.',
                })
              }
              entry.requests = 0
              entry.failures = 0
              return
            }

            entry.requests += 1
            if (entry.failures >= maxFailures || entry.requests > maxRequests) {
              throw new APIError('FORBIDDEN', {
                code: CAPTCHA_REQUIRED,
                message:
                  'Additional verification required. Complete the check, then submit again.',
              })
            }
          }),
        },
      ],
      after: [
        {
          matcher: (ctx) => matches(ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.returned
            if (
              returned instanceof APIError &&
              returned.body?.code !== CAPTCHA_REQUIRED
            ) {
              bucket(clientKey(ctx.headers)).failures += 1
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
