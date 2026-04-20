/**
 * POST /api/auth/send-code
 *
 * Generates and emails a server-side OTP.
 */

import { NextResponse } from 'next/server'
import { RateLimiter } from '@api/_lib/rate-limit.js'
import { sendOtpCode } from '@features/auth/server/sendOtpCode.js'

const limiter = new RateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 })

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()
  const { allowed, retryAfterMs } = limiter.check(email)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests — please wait before requesting another code', retryAfterMs },
      { status: 429 }
    )
  }

  const result = await sendOtpCode({ ...body, email })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
