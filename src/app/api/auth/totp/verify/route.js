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
import { authAttemptOperationKey, beginBackendOperation } from '@features/auth/server/backendOperation.js'
import { consumeDistributedRateLimit }  from '@features/auth/server/distributedRateLimit.js'
import { verifyTotpLogin }              from '@features/auth/server/loginVerification.js'
import { issueRecoverableSession }      from '@features/auth/server/recoverableSession.js'
import { validateEmail }                from '@shared/utils/emailValidation'

export async function POST(request) {
  const body  = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()
  const code  = (body.code  ?? '').replace(/\D/g, '').slice(0, 6)

  if (!validateEmail(email).valid || code.length !== 6) {
    return NextResponse.json({ error: 'email and 6-digit code required' }, { status: 400 })
  }

  const { allowed, retryAfterMs, error: limitError } = await consumeDistributedRateLimit({
    scope: 'auth_verify_totp_email',
    identifier: email,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (limitError) {
    console.error('[totp/verify POST] rate limit error:', limitError)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts — please try again later', retryAfterMs },
      { status: 429 }
    )
  }

  const operationKey = authAttemptOperationKey({ operationType: 'login_totp', email, code })
  const operation = await beginBackendOperation({
    operationKey,
    operationType: 'login_totp',
    email,
  })
  if (operation.error) {
    console.error('[totp/verify POST] begin operation error:', operation.error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
  if (operation.replay) {
    return issueRecoverableSession({
      operation,
      operationKey,
      operationType: 'login_totp',
      email,
      body: operation.replay.body,
      status: operation.replay.status,
      session: operation.replay.session,
      failureMessage: 'Failed to create session',
    })
  }

  const result = await verifyTotpLogin({ email, code })
  if (!result.session) return NextResponse.json(result.body, { status: result.status })

  return issueRecoverableSession({
    operation,
    operationKey,
    operationType: 'login_totp',
    email,
    body: result.body,
    status: result.status,
    session: result.session,
    failureMessage: 'Failed to create session',
  })
}
