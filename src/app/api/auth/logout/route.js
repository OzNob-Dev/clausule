/**
 * POST /api/auth/logout
 *
 * Revokes the refresh token in the DB and clears both auth cookies.
 * Best-effort — always responds 200 so the client can proceed to clear
 * local state regardless of server-side errors.
 *
 * 200: { ok: true }
 */

import { NextResponse }            from 'next/server'
import { getRefreshToken,
         clearAuthCookies }        from '@api/_lib/auth.js'
import { revokeRefreshSession }    from '@features/auth/server/refreshSession.js'

export async function POST(request) {
  const rawToken = getRefreshToken(request)

  if (rawToken) {
    await revokeRefreshSession(rawToken).catch((err) => {
      // Non-fatal — cookie expiry handles this if the DB call fails.
      console.warn('[logout] failed to revoke refresh token:', err?.message)
    })
  }

  const response = NextResponse.json({ ok: true })
  clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
  return response
}
