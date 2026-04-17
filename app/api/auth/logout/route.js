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
import { hashRefreshToken }        from '@api/_lib/jwt.js'
import { update }                  from '@api/_lib/supabase.js'

export async function POST(request) {
  const rawToken = getRefreshToken(request)

  if (rawToken) {
    const tokenHash = hashRefreshToken(rawToken)
    // Mark the refresh token as used so it cannot be replayed after logout.
    await update(
      'refresh_tokens',
      `token_hash=eq.${tokenHash}&used_at=is.null`,
      { used_at: new Date().toISOString() }
    ).catch((err) => {
      // Non-fatal — cookie expiry handles this if the DB call fails.
      console.warn('[logout] failed to revoke refresh token:', err?.message)
    })
  }

  const response = NextResponse.json({ ok: true })
  clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
  return response
}
