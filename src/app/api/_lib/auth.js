/**
 * Server-side auth helpers for Next.js App Router API routes.
 *
 * Two httpOnly cookies are used:
 *   clausule_at  — HS256 JWT access token  (15 min, SameSite=Lax)
 *   clausule_rt  — opaque refresh token    (30 days, SameSite=Lax)
 *
 * `requireAuth` verifies the access token locally — no DB or Supabase
 * round-trip on every request.  Use the /api/auth/refresh route to exchange
 * an expired access token for a fresh pair when the client gets a 401.
 */

import { NextResponse }                        from 'next/server'
import { verifyAccessToken, ACCESS_TOKEN_TTL_S,
         REFRESH_TOKEN_TTL_S }                 from './jwt.js'
import { authTestBypassUser, isAuthTestBypassEnabled } from '@shared/utils/authTestBypass.js'

const IS_PROD = process.env.NODE_ENV === 'production'

const COOKIE_AT = 'clausule_at'   // access token
const COOKIE_RT = 'clausule_rt'   // refresh token
const COOKIE_SESSION = 'clausule_session'

// ── Cookie extraction ─────────────────────────────────────────────────────────

/**
 * Parse a named cookie value from the Cookie header.
 * @param {Request} request
 * @param {string}  name
 * @returns {string|null}
 */
function getCookie(request, name) {
  const header = request.headers.get('cookie') ?? ''
  const match  = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function getAccessToken(request)  { return getCookie(request, COOKIE_AT) }
export function getRefreshToken(request) { return getCookie(request, COOKIE_RT) }

// ── Cookie builders ───────────────────────────────────────────────────────────

function cookieFlags(maxAge) {
  return [
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Priority=High',
    IS_PROD ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

/**
 * Set-Cookie string for the access token.
 * @param {string} token
 * @returns {string}
 */
export function accessTokenCookie(token) {
  return `${COOKIE_AT}=${encodeURIComponent(token)}; ${cookieFlags(ACCESS_TOKEN_TTL_S)}`
}

/**
 * Set-Cookie string for the refresh token.
 * @param {string} token
 * @returns {string}
 */
export function refreshTokenCookie(token) {
  return `${COOKIE_RT}=${encodeURIComponent(token)}; ${cookieFlags(REFRESH_TOKEN_TTL_S)}`
}

export function sessionCookie() {
  return `${COOKIE_SESSION}=1; Max-Age=${REFRESH_TOKEN_TTL_S}; Path=/; SameSite=Lax; Priority=High${IS_PROD ? '; Secure' : ''}`
}

/**
 * Pair of Set-Cookie strings that expire both tokens immediately (logout).
 * @returns {string[]}
 */
export function clearAuthCookies() {
  return [
    `${COOKIE_AT}=; ${cookieFlags(0)}`,
    `${COOKIE_RT}=; ${cookieFlags(0)}`,
    `${COOKIE_SESSION}=; Max-Age=0; Path=/; SameSite=Lax; Priority=High${IS_PROD ? '; Secure' : ''}`,
  ]
}

// ── Auth guard ────────────────────────────────────────────────────────────────

/**
 * Verify the access-token cookie and return decoded claims.
 * Returns `{ userId, email, role, authMethod, error }`.
 *
 * On expired / missing token the caller should redirect the client to call
 * POST /api/auth/refresh, then retry the original request.
 *
 * @param {Request} request
 * @returns {{ userId: string|null, email: string|null, role: string|null, authMethod: string|null, error: string|null }}
 */
export function requireAuth(request) {
  if (isAuthTestBypassEnabled()) {
    return {
      userId: authTestBypassUser.id,
      email: authTestBypassUser.email,
      role: authTestBypassUser.role,
      authMethod: authTestBypassUser.authMethod,
      error: null,
    }
  }

  const token = getAccessToken(request)

  if (!token) {
    return { userId: null, email: null, role: null, authMethod: null, error: 'Unauthenticated' }
  }

  try {
    const claims = verifyAccessToken(token)
    return { userId: claims.sub, email: claims.email, role: claims.role, authMethod: claims.amr ?? 'unknown', error: null }
  } catch (err) {
    // Surface 'Token expired' separately so clients can attempt a refresh.
    const expired = err.message === 'Token expired'
    return {
      userId: null,
      email:  null,
      role:   null,
      authMethod: null,
      error:  expired ? 'Token expired' : 'Invalid token',
    }
  }
}

// ── Standard error responses ─────────────────────────────────────────────────

export function unauthorized(message = 'Unauthenticated') {
  return NextResponse.json({ error: message }, { status: 401 })
}
