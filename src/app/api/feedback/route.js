import { NextResponse } from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { consumeDistributedRateLimit } from '@features/auth/server/distributedRateLimit.js'
import { listAppFeedback, sendAppFeedback } from '@features/brag/server/appFeedback.js'

export async function GET(request) {
  const auth = await requireActiveAuth(request)
  if (auth.error) return authErrorResponse(auth.error)

  const result = await listAppFeedback({ userId: auth.userId })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(request) {
  const auth = await requireActiveAuth(request)
  if (auth.error) return authErrorResponse(auth.error)
  const { allowed, retryAfterMs, error } = await consumeDistributedRateLimit({
    scope: 'feedback_post_user',
    identifier: auth.userId,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (error) {
    console.error('[feedback] rate limit error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

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
