/**
 * POST /api/auth/verify-code
 *
 * Verifies the 6-digit OTP submitted by the user.
 * On success:
 *   - Marks the OTP row as used
 *   - Signs the user in via Supabase (issues access + refresh tokens)
 *   - Sets an httpOnly session cookie
 *
 * Body: { email: string, code: string }
 * Response 200: { ok: true, role: string }
 * Response 400: { error: string }
 * Response 401: { error: string }
 */

import { NextResponse }                       from 'next/server'
import crypto                                 from 'node:crypto'
import { select, update, signInAsUser }       from '../../../_lib/supabase.js'
import { buildSessionCookie }                 from '../../../_lib/auth.js'
import { RateLimiter }                        from '../../../_lib/rate-limit.js'

// 5 verification attempts per 10 minutes per email to slow brute force.
const limiter = new RateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

/**
 * Constant-time comparison to prevent timing attacks.
 */
function safeEqual(a, b) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request) {
  const body  = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()
  const code  = (body.code ?? '').replace(/\D/g, '').slice(0, 6)

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

  // Fetch the most recent unused, unexpired OTP for this email.
  const query = new URLSearchParams({
    email:      `eq.${email}`,
    used_at:    'is.null',
    expires_at: `gt.${new Date().toISOString()}`,
    order:      'created_at.desc',
    limit:      '1',
  })

  const { data: rows, error: dbError } = await select('otp_codes', query.toString())

  if (dbError || !rows?.length) {
    // Return generic message to avoid leaking whether an OTP was sent.
    return NextResponse.json(
      { error: 'Invalid or expired code — request a new one' },
      { status: 401 }
    )
  }

  const row = rows[0]
  const [salt, storedHash] = row.code_hash.split(':')

  // Derive hash of the submitted code using the same salt.
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

  // Mark OTP as used so it cannot be replayed.
  await update('otp_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })

  // Issue a Supabase session for this user.
  const { data: session, error: sessError } = await signInAsUser(email)

  if (sessError || !session?.access_token) {
    console.error('[verify-code] signInAsUser error:', sessError)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  // Determine role from the profile (created by DB trigger on first sign-in).
  let role = 'employee'
  try {
    const { data: profiles } = await select(
      'profiles',
      `email=eq.${email}&select=role&limit=1`
    )
    if (profiles?.[0]?.role) role = profiles[0].role
  } catch {
    // Non-fatal — default to employee.
  }

  const response = NextResponse.json({ ok: true, role })
  response.headers.set(
    'Set-Cookie',
    buildSessionCookie(session.access_token, session.expires_in ?? 3600)
  )
  return response
}
