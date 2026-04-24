/**
 * POST /api/auth/send-code
 *
 * Generates and emails a server-side OTP.
 */

import { NextResponse } from 'next/server'
import { consumeDistributedRateLimit } from '@features/auth/server/distributedRateLimit.js'
import { sendOtpCode } from '@features/auth/server/sendOtpCode.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()
  const { allowed, retryAfterMs, error } = await consumeDistributedRateLimit({
    scope: 'auth_send_code_email',
    identifier: email,
    limit: 3,
    windowMs: 10 * 60 * 1000,
  })
  if (error) {
    console.error('[send-code] rate limit error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

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
