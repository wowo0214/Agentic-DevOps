import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'
import { R } from '@repo/http-contract'

// Other sites allowed to send writes to this server; add an origin here by hand when one is needed.
const TRUSTED_ORIGINS: string[] = []
const READ_METHODS = ['GET', 'HEAD', 'OPTIONS']

export function proxy(request: NextRequest) {
  // A write must come from this site's own pages or a trusted origin (CSRF).
  const allowed = [request.nextUrl.origin, ...TRUSTED_ORIGINS]
  if (
    !READ_METHODS.includes(request.method) &&
    !allowed.includes(request.headers.get('origin') ?? '')
  )
    return R.error('请求来源无效', 403)

  const returnTo = request.nextUrl.pathname + request.nextUrl.search

  // Without cookie, deny access.
  if (!getSessionCookie(request)) {
    const loginUrl = new URL('/auth/sign-in', request.url)
    loginUrl.searchParams.set('redirectTo', returnTo)
    return NextResponse.redirect(loginUrl)
  }

  const requestHeaders = new Headers(request.headers)
  // Overwrite any client-supplied value with the actual requested path.
  requestHeaders.set('x-auth-return-to', returnTo)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Match all paths except auth and static assets
  matcher: [
    '/((?!api/auth(?:/|$)|auth(?:/|$)|claude(?:/|$)|_next/static|_next/image|favicon.ico).*)',
  ],
}
