/**
 * POST /api/auth/totp/verify
 *
 * Pre-authentication TOTP login — verifies a 6-digit code against the
 * stored TOTP secret for the given email address and issues a session.
 *
 * Body:   { email: string, code: string }
 * 200:    { ok: true, role: string }
 * 400:    { error: string }
 * 401:    { error: string }
 * 429:    { error: string, retryAfterMs: number }
 */

import { NextResponse }                 from 'next/server'
import { select }                       from '@api/_lib/supabase.js'
import { appendSessionCookies,
         createPersistentSession }      from '@api/_lib/session.js'
import { RateLimiter }                  from '@api/_lib/rate-limit.js'
import { verifyTotp }                   from '@api/_lib/totp.js'
import { validateEmail }                from '@shared/utils/emailValidation'

// 5 attempts per 10 minutes per email — matches verify-code policy.
const limiter = new RateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

function profileQuery(email) {
  return new URLSearchParams({ email: `ilike.${email}`, select: 'id,role,totp_secret', limit: '1' }).toString()
}

export async function POST(request) {
  const body  = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()
  const code  = (body.code  ?? '').replace(/\D/g, '').slice(0, 6)

  if (!validateEmail(email).valid || code.length !== 6) {
    return NextResponse.json({ error: 'email and 6-digit code required' }, { status: 400 })
  }

  const { allowed, retryAfterMs } = limiter.check(email)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts — please try again later', retryAfterMs },
      { status: 429 }
    )
  }

  const { data: profiles, error: dbError } = await select(
    'profiles',
    profileQuery(email)
  )

  if (dbError || !profiles?.length || !profiles[0].totp_secret) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  const { id: userId, role, totp_secret: secret } = profiles[0]

  if (!verifyTotp(secret, code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  try {
    const response = NextResponse.json({ ok: true, role })
    const session  = await createPersistentSession({ userId, email, role, authMethod: 'totp' })
    return appendSessionCookies(response, session)
  } catch (err) {
    console.error('[totp/verify POST] session error:', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
