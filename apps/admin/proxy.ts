import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
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
    '/((?!api/auth(?:/|$)|auth(?:/|$)|_next/static|_next/image|favicon.ico).*)',
  ],
}
