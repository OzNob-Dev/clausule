/**
 * POST /api/auth/verify-code
 *
 * Verifies the 6-digit OTP and issues a JWT access token + opaque refresh token.
 *
 * On success:
 *   1. OTP row is marked as used (single-use, replay-safe)
 *   2. A signed HS256 JWT access token is issued (15 min)
 *   3. A random opaque refresh token is issued (30 days)
 *      — SHA-256 hash stored in the `refresh_tokens` table
 *   4. Both tokens set as httpOnly cookies
 *
 * Body:   { email: string, code: string }
 * 200:    { ok: true, role: string }
 * 400:    { error: string }
 * 401:    { error: string }
 * 429:    { error: string, retryAfterMs: number }
 */

import { NextResponse }                    from 'next/server'
import crypto                              from 'node:crypto'
import { select, update, insert }          from '../../../_lib/supabase.js'
import { signAccessToken,
         generateRefreshToken,
         REFRESH_TOKEN_TTL_S }             from '../../../_lib/jwt.js'
import { accessTokenCookie,
         refreshTokenCookie }              from '../../../_lib/auth.js'
import { RateLimiter }                     from '../../../_lib/rate-limit.js'

// 5 attempts per 10 minutes per email.
const limiter = new RateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

function safeEqual(a, b) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request) {
  const body  = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()
  const code  = (body.code  ?? '').replace(/\D/g, '').slice(0, 6)

  if (!email || code.length !== 6) {
    return NextResponse.json({ error: 'email and 6-digit code required' }, { status: 400 })
  }

  // Rate limit by email.
  const { allowed, retryAfterMs } = limiter.check(email)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts — please request a new code', retryAfterMs },
      { status: 429 }
    )
  }

  // ── 1. Fetch the most recent unused, unexpired OTP ─────────────────────────
  const query = new URLSearchParams({
    email:      `eq.${email}`,
    used_at:    'is.null',
    expires_at: `gt.${new Date().toISOString()}`,
    order:      'created_at.desc',
    limit:      '1',
  })

  const { data: rows, error: dbError } = await select('otp_codes', query.toString())

  if (dbError || !rows?.length) {
    // Generic message — don't reveal whether an OTP was ever sent.
    return NextResponse.json(
      { error: 'Invalid or expired code — request a new one' },
      { status: 401 }
    )
  }

  // ── 2. Verify OTP (constant-time) ─────────────────────────────────────────
  const row = rows[0]
  const [salt, storedHash] = row.code_hash.split(':')

  const submittedHash = crypto
    .createHmac('sha256', salt)
    .update(code)
    .digest('hex')

  if (!safeEqual(submittedHash, storedHash)) {
    return NextResponse.json(
      { error: 'Invalid or expired code — request a new one' },
      { status: 401 }
    )
  }

  // Mark OTP as used immediately — single-use guarantee.
  await update('otp_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })

  // ── 3. Load user profile ───────────────────────────────────────────────────
  const { data: profiles, error: profileError } = await select(
    'profiles',
    `email=eq.${email}&select=id,role&limit=1`
  )

  if (profileError || !profiles?.length) {
    console.error('[verify-code] profile lookup failed:', profileError)
    return NextResponse.json({ error: 'User account not found' }, { status: 404 })
  }

  const { id: userId, role } = profiles[0]

  // ── 4. Issue tokens ────────────────────────────────────────────────────────
  // Access token: short-lived JWT verified locally on each request.
  const accessToken = signAccessToken({ userId, email, role })

  // Refresh token: opaque random value, hash stored in DB for rotation/revocation.
  const { token: refreshToken, hash: refreshHash } = generateRefreshToken()

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_S * 1000).toISOString()

  const { error: rtError } = await insert('refresh_tokens', {
    user_id:    userId,
    token_hash: refreshHash,
    expires_at: expiresAt,
  })

  if (rtError) {
    console.error('[verify-code] refresh token insert failed:', rtError)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  // ── 5. Set httpOnly cookies and respond ────────────────────────────────────
  const response = NextResponse.json({ ok: true, role })
  response.headers.append('Set-Cookie', accessTokenCookie(accessToken))
  response.headers.append('Set-Cookie', refreshTokenCookie(refreshToken))
  return response
}
