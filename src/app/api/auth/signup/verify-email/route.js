import { NextResponse } from 'next/server'
import { resolveClientIp } from '@api/_lib/network.js'
import { consumeDistributedRateLimit } from '@features/auth/server/distributedRateLimit.js'
import { verifyEmailOtpCode } from '@features/auth/server/emailOtpVerification.js'
import { signSignupVerificationToken } from '@features/auth/server/signupVerification.js'
import { validateEmail } from '@shared/utils/emailValidation'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = String(body.email ?? '').trim().toLowerCase()
  const code = String(body.code ?? '').replace(/\D/g, '').slice(0, 6)

  if (!validateEmail(email).valid || code.length !== 6) {
    return NextResponse.json({ error: 'email and 6-digit code required' }, { status: 400 })
  }

  const ip = resolveClientIp(request)

  const { allowed: ipAllowed, retryAfterMs: ipRetry, error: ipLimitError } = await consumeDistributedRateLimit({
    scope: 'signup_verify_email_ip',
    identifier: ip,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (ipLimitError) {
    console.error('[signup/verify-email] IP rate limit error:', ipLimitError)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
  if (!ipAllowed) {
    return NextResponse.json({ error: 'Too many attempts — please try again later', retryAfterMs: ipRetry }, { status: 429, headers: { 'Retry-After': String(Math.ceil(ipRetry / 1000)) } })
  }

  const { allowed: emailAllowed, retryAfterMs: emailRetry, error: emailLimitError } = await consumeDistributedRateLimit({
    scope: 'signup_verify_email_email',
    identifier: email,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (emailLimitError) {
    console.error('[signup/verify-email] email rate limit error:', emailLimitError)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
  if (!emailAllowed) {
    return NextResponse.json({ error: 'Too many attempts — please request a new code', retryAfterMs: emailRetry }, { status: 429, headers: { 'Retry-After': String(Math.ceil(emailRetry / 1000)) } })
  }

  const verified = await verifyEmailOtpCode(email, code)
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status })
  }

  return NextResponse.json({
    ok: true,
    verificationToken: signSignupVerificationToken(email),
  })
}
