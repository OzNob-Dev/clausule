/**
 * Server-side session helpers for Next.js App Router API routes.
 *
 * The session is stored in an httpOnly, Secure, SameSite=Lax cookie named
 * "clausule_session" whose value is the Supabase access token (JWT).
 *
 * Usage:
 *   const { userId, error } = await requireAuth(request)
 *   if (error) return NextResponse.json({ error }, { status: 401 })
 */

import { NextResponse } from 'next/server'

const COOKIE_NAME    = 'clausule_session'
const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Verify the session cookie and return the authenticated user's ID.
 * @param {Request} request
 * @returns {Promise<{ userId: string|null, error: string|null }>}
 */
export async function requireAuth(request) {
  const token = getSessionToken(request)
  if (!token) return { userId: null, error: 'Unauthenticated' }

  // Ask Supabase to validate the JWT.
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) return { userId: null, error: 'Invalid or expired session' }

  const user = await res.json()
  return { userId: user.id, error: null }
}

/**
 * Extract the session token from the Cookie header.
 * @param {Request} request
 * @returns {string|null}
 */
export function getSessionToken(request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Build the Set-Cookie header string for a session token.
 * @param {string} token - Supabase access_token (JWT)
 * @param {number} maxAgeSeconds
 * @returns {string}
 */
export function buildSessionCookie(token, maxAgeSeconds = 3600) {
  const flags = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    // Omit Secure in development to work on http://localhost
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean)

  return flags.join('; ')
}

/**
 * Build a cookie header that immediately expires the session cookie (logout).
 * @returns {string}
 */
export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
}

/**
 * Return a 401 JSON response.
 */
export function unauthorized(message = 'Unauthenticated') {
  return NextResponse.json({ error: message }, { status: 401 })
}
