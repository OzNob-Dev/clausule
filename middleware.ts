import { NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/components', '/entries', '/profile', '/brag', '/mfa-setup']

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  if (!isProtectedPath(pathname)) return NextResponse.next()
  if (request.cookies.get('clausule_session')) return NextResponse.next()
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|css|js|map)).*)'],
}
