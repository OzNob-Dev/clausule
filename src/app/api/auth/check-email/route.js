/**
 * POST /api/auth/check-email
 *
 * Returns whether an email address has a registered account and whether
 * that account has TOTP configured — used by the sign-in page to route
 * the user to the correct MFA step.
 *
 * Body:     { email: string }
 * Response: { exists: boolean, hasMfa: boolean, hasSso: boolean, ssoProvider: string | null }
 */

import { NextResponse }   from 'next/server'
import { RateLimiter }    from '@api/_lib/rate-limit.js'
import { checkEmailAccount } from '@features/auth/server/checkEmail'
import { validateEmail }  from '@shared/utils/emailValidation'

// 20 checks per minute per IP — enough for normal use, tight for enumeration.
const limiter = new RateLimiter({ limit: 20, windowMs: 60 * 1000 })

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = limiter.check(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body  = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()

  const validation = validateEmail(email)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { result, error, log } = await checkEmailAccount(email)
  if (error) {
    console.error(`[check-email] ${log}:`, error)
    return NextResponse.json({ error: 'Email check failed' }, { status: 500 })
  }

  return NextResponse.json(result)
}
