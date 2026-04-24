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
import { RateLimiter }                     from '@api/_lib/rate-limit.js'
import { beginBackendOperation }          from '@features/auth/server/backendOperation.js'
import { verifyEmailOtpLogin }             from '@features/auth/server/loginVerification.js'
import { issueRecoverableSession }         from '@features/auth/server/recoverableSession.js'

// 5 attempts per 10 minutes per email.
const limiter = new RateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

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

  const operationKey = `login:otp:${email}:${code}`
  const operation = await beginBackendOperation({
    operationKey,
    operationType: 'login_otp',
    email,
  })
  if (operation.error) {
    console.error('[verify-code] begin operation error:', operation.error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
  if (operation.replay) {
    return issueRecoverableSession({
      operation,
      operationKey,
      operationType: 'login_otp',
      email,
      body: operation.replay.body,
      status: operation.replay.status,
      session: operation.replay.session,
      failureMessage: 'Failed to create session',
    })
  }

  const result = await verifyEmailOtpLogin({ email, code })
  if (result.log) console.error(...result.log)
  if (!result.session) return NextResponse.json(result.body, { status: result.status })

  return issueRecoverableSession({
    operation,
    operationKey,
    operationType: 'login_otp',
    email,
    body: result.body,
    status: result.status,
    session: result.session,
    failureMessage: 'Failed to create session',
  })
}
