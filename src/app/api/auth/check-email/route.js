/**
 * POST /api/auth/check-email
 *
 * Returns whether an email address has a registered account and whether
 * that account has TOTP configured — used by the sign-in page to route
 * the user to the correct MFA step.
 *
 * Body:     { email: string }
 * Response: { nextStep: 'continue' }
 */

import { NextResponse }   from 'next/server'
import { consumeDistributedRateLimit } from '@features/auth/server/distributedRateLimit.js'
import { validateEmail }  from '@shared/utils/emailValidation'

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed, error: limitError } = await consumeDistributedRateLimit({
    scope: 'auth_check_email_ip',
    identifier: ip,
    limit: 20,
    windowMs: 60 * 1000,
  })
  if (limitError) {
    console.error('[check-email] rate limit error:', limitError)
    return NextResponse.json({ error: 'Email check failed' }, { status: 500 })
  }
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body  = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()

  const validation = validateEmail(email)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  return NextResponse.json({ nextStep: 'continue' })
}
