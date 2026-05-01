import { NextRequest, NextResponse } from 'next/server'
import { PROTECTED_PREFIXES, isRouteMatch } from './src/shared/utils/routePolicy'

const AUTH_COOKIE_NAMES = ['clausule_session', 'clausule_at', 'clausule_rt'] as const

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => isRouteMatch(pathname, prefix))
}

function hasAuthCookie(request: NextRequest) {
  return AUTH_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-clausule-pathname', pathname)

  if (!isProtectedPath(pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  if (hasAuthCookie(request)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|css|js|map)).*)'],
}
