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
import { select, update, del }             from '@api/_lib/supabase.js'
import { hashRefreshToken }                from '@api/_lib/jwt.js'
import { getRefreshToken,
         clearAuthCookies }                from '@api/_lib/auth.js'
import { appendSessionCookies,
         createPersistentSession }         from '@api/_lib/session.js'

export async function POST(request) {
  const rawToken = getRefreshToken(request)

  if (!rawToken) {
    const response = NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }

  const tokenHash = hashRefreshToken(rawToken)

  // ── 1. Look up the refresh token row ──────────────────────────────────────
  const { data: rows } = await select(
    'refresh_tokens',
    `token_hash=eq.${tokenHash}&limit=1`
  )

  const row = rows?.[0]

  if (!row) {
    // Token not found — either never issued or already family-revoked.
    const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }

  // ── 2. Replay detection ────────────────────────────────────────────────────
  if (row.used_at) {
    // Token already used: this is a replay attack or a stolen token.
    // Revoke ALL refresh tokens for this user (family revocation).
    await del('refresh_tokens', `user_id=eq.${row.user_id}`)
    console.warn(`[refresh] replay detected for user ${row.user_id} — all tokens revoked`)

    const response = NextResponse.json(
      { error: 'Session invalidated — please sign in again' },
      { status: 401 }
    )
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }

  // ── 3. Check expiry ────────────────────────────────────────────────────────
  if (new Date(row.expires_at) <= new Date()) {
    await update('refresh_tokens', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
    const response = NextResponse.json({ error: 'Refresh token expired — please sign in again' }, { status: 401 })
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }

  // ── 4. Load user profile ───────────────────────────────────────────────────
  const { data: profiles } = await select(
    'profiles',
    `id=eq.${row.user_id}&select=id,email,role&limit=1`
  )

  if (!profiles?.length) {
    await del('refresh_tokens', `user_id=eq.${row.user_id}`)
    const response = NextResponse.json({ error: 'User not found' }, { status: 401 })
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }

  const { id: userId, email, role } = profiles[0]

  // ── 5. Rotate: mark current token used, issue new pair ────────────────────
  // Mark the old refresh token as used — must happen before issuing new one
  // so a crash between the two steps leaves the user in a known state.
  const { error: revokeError } = await update(
    'refresh_tokens',
    `id=eq.${row.id}&used_at=is.null`,
    { used_at: new Date().toISOString() }
  )

  if (revokeError) {
    console.error('[refresh] failed to revoke current refresh token:', revokeError)
    const response = NextResponse.json({ error: 'Failed to rotate session' }, { status: 500 })
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }

  try {
    const response = NextResponse.json({ ok: true, role })
    const session = await createPersistentSession({ userId, email, role })
    return appendSessionCookies(response, session)
  } catch (err) {
    console.error('[refresh] failed to insert rotated refresh token:', err)
    const response = NextResponse.json({ error: 'Failed to rotate session' }, { status: 500 })
    clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  }
}
