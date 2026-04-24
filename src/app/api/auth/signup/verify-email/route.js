import { NextResponse } from 'next/server'
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

  const verified = await verifyEmailOtpCode(email, code)
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status })
  }

  return NextResponse.json({
    ok: true,
    verificationToken: signSignupVerificationToken(email),
  })
}
