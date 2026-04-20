/**
 * POST /api/auth/signup
 *
 * Creates a new Supabase Auth user.
 */

import { NextResponse } from 'next/server'
import { RateLimiter } from '@api/_lib/rate-limit.js'
import { createSignupUser } from '@features/auth/server/createSignupUser.js'

const limiter = new RateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed, retryAfterMs } = limiter.check(ip)

  if (!allowed) {
    return NextResponse.json({ error: 'Too many signup requests', retryAfterMs }, { status: 429 })
  }

  const result = await createSignupUser(await request.json().catch(() => ({})))
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
