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
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const { allowed: ipAllowed, retryAfterMs: ipRetry, error: ipError } = await consumeDistributedRateLimit({
    scope: 'auth_send_code_ip',
    identifier: ip,
    limit: 15,
    windowMs: 10 * 60 * 1000,
  })
  if (ipError) {
    console.error('[send-code] IP rate limit error:', ipError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
  if (!ipAllowed) {
    return NextResponse.json({ error: 'Too many requests — please try again later', retryAfterMs: ipRetry }, { status: 429 })
  }

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
