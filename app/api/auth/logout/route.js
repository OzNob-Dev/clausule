/**
 * POST /api/auth/logout
 *
 * Clears the session cookie and revokes the Supabase refresh token.
 *
 * Response 200: { ok: true }
 */

import { NextResponse }                from 'next/server'
import { getSessionToken,
         clearSessionCookie }          from '../../../_lib/auth.js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request) {
  const token = getSessionToken(request)

  if (token) {
    // Best-effort revoke of the token on Supabase side.
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey:        SERVICE_KEY,
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => { /* ignore network errors on logout */ })
  }

  const response = NextResponse.json({ ok: true })
  response.headers.set('Set-Cookie', clearSessionCookie())
  return response
}
