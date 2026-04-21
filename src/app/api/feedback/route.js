import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@api/_lib/auth.js'
import { RateLimiter } from '@api/_lib/rate-limit.js'
import { listAppFeedback, sendAppFeedback } from '@features/brag/server/appFeedback.js'

const postLimiter = new RateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

export async function GET(request) {
  const auth = requireAuth(request)
  if (auth.error) return unauthorized()

  const result = await listAppFeedback({ userId: auth.userId })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(request) {
  const auth = requireAuth(request)
  if (auth.error) return unauthorized()
  const { allowed, retryAfterMs } = postLimiter.check(auth.userId)

  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests', retryAfterMs }, { status: 429 })
  }

  const result = await sendAppFeedback({
    body: await request.json().catch(() => ({})),
    user: { userId: auth.userId, email: auth.email },
  })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
