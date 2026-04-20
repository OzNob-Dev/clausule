/**
 * POST /api/auth/refresh
 *
 * Exchanges a valid refresh token for a new access token + rotated refresh token.
 *
 * Refresh token rotation:
 *   - The submitted refresh token is immediately revoked (marked used_at).
 *   - A new refresh token is issued and its hash stored in the DB.
 *   - If the same refresh token is submitted twice (replay), both the old and
 *     new tokens are revoked (family revocation — all tokens for that user).
 *
 * The access token cookie is set on the response; the client should retry
 * the original request automatically.
 *
 * 200:  { ok: true, role: string }
 * 401:  { error: string }
 */

import { NextResponse }                    from 'next/server'
import { getRefreshToken,
         clearAuthCookies }                from '@api/_lib/auth.js'
import { appendSessionCookies,
         createPersistentSession }         from '@api/_lib/session.js'
import { rotateRefreshSession }            from '@features/auth/server/refreshSession.js'

function withClearedCookies(response) {
  clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
  return response
}

export async function POST(request) {
  const rawToken = getRefreshToken(request)
  const result = await rotateRefreshSession(rawToken)

  if (result.log?.[0] === 'warn') console.warn(result.log[1])
  if (result.log?.[0] === 'error') console.error(...result.log.slice(1))
  if (!result.session) return result.clearCookies
    ? withClearedCookies(NextResponse.json(result.body, { status: result.status }))
    : NextResponse.json(result.body, { status: result.status })

  try {
    const response = NextResponse.json(result.body)
    const session = await createPersistentSession(result.session)
    return appendSessionCookies(response, session)
  } catch (err) {
    console.error('[refresh] failed to insert rotated refresh token:', err)
    return withClearedCookies(NextResponse.json({ error: 'Failed to rotate session' }, { status: 500 }))
  }
}
