/**
 * POST /api/auth/register
 *
 * Lightweight registration endpoint — no payment required.
 * Creates or updates a user profile and immediately issues JWT session cookies.
 *
 * Temporary: replaces the Stripe subscribe flow while payment is disabled.
 * Replace with /api/payments/subscribe when Stripe is re-enabled.
 *
 * Body:   { email: string, firstName: string, lastName?: string }
 * 200:    { ok: true, role: string }
 * 400:    { error: string }
 * 500:    { error: string }
 */

import { NextResponse }                     from 'next/server'
import { accessTokenCookie,
         refreshTokenCookie }               from '@api/_lib/auth.js'
import { signAccessToken, generateRefreshToken,
         REFRESH_TOKEN_TTL_S }              from '@api/_lib/jwt.js'
import { insert, select, upsert,
         createUser }                       from '@api/_lib/supabase.js'

export async function POST(request) {
  const body      = await request.json().catch(() => ({}))
  const email     = (body.email     ?? '').trim().toLowerCase()
  const firstName = (body.firstName ?? '').trim()
  const lastName  = (body.lastName  ?? '').trim()

  if (!email)     return NextResponse.json({ error: 'email is required' },     { status: 400 })
  if (!firstName) return NextResponse.json({ error: 'firstName is required' }, { status: 400 })

  try {
    // ── Resolve userId ──────────────────────────────────────────────────────
    let userId

    const { data: profiles } = await select(
      'profiles',
      new URLSearchParams({ email: `eq.${email}`, select: 'id', limit: '1' }).toString()
    )

    if (profiles?.length) {
      userId = profiles[0].id
    } else {
      const { data: created, error: createErr } = await createUser({
        email,
        user_metadata: { first_name: firstName, last_name: lastName || undefined },
      })
      if (createErr) {
        console.error('[register] createUser error:', createErr)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
      userId = created.id
    }

    // ── Save / update profile ───────────────────────────────────────────────
    const { data: upserted } = await upsert('profiles', {
      id:         userId,
      email,
      first_name: firstName,
      last_name:  lastName || null,
    })

    const role = (Array.isArray(upserted) ? upserted[0]?.role : upserted?.role) ?? 'employee'

    // ── Issue JWT session ───────────────────────────────────────────────────
    const accessToken = signAccessToken({ userId, email, role })

    const { token: refreshToken, hash: refreshHash } = generateRefreshToken()
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_S * 1000).toISOString()

    const { error: rtError } = await insert('refresh_tokens', {
      user_id:    userId,
      token_hash: refreshHash,
      expires_at: expiresAt,
    })

    if (rtError) {
      console.error('[register] refresh token insert failed:', rtError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    const response = NextResponse.json({ ok: true, role })
    response.headers.append('Set-Cookie', accessTokenCookie(accessToken))
    response.headers.append('Set-Cookie', refreshTokenCookie(refreshToken))
    return response
  } catch (err) {
    console.error('[register] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
