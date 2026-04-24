/**
 * POST /api/auth/signup
 *
 * Creates a new Supabase Auth user.
 */

import { NextResponse } from 'next/server'
import { consumeDistributedRateLimit } from '@features/auth/server/distributedRateLimit.js'
import { createSignupUser } from '@features/auth/server/createSignupUser.js'

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed, retryAfterMs, error } = await consumeDistributedRateLimit({
    scope: 'auth_signup_ip',
    identifier: ip,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (error) {
    console.error('[signup] rate limit error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  if (!allowed) {
    return NextResponse.json({ error: 'Too many signup requests', retryAfterMs }, { status: 429 })
  }

  const result = await createSignupUser(await request.json().catch(() => ({})))
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
