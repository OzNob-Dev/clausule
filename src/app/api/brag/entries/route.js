/**
 * /api/brag/entries
 *
 * GET lists entries. POST creates an entry.
 */

import { NextResponse } from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { createEntry, listEntries } from '@features/brag/server/entries.js'
import { consumeDistributedRateLimit } from '@features/auth/server/distributedRateLimit.js'

export async function GET(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const result = await listEntries({ userId, searchParams: new URL(request.url).searchParams })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const { allowed, retryAfterMs, error: limitError } = await consumeDistributedRateLimit({
    scope: 'brag_entry_create',
    identifier: userId,
    limit: 60,
    windowMs: 60 * 60 * 1000,
  })
  if (limitError) console.error('[brag/entries POST] rate limit error:', limitError)
  if (!limitError && !allowed) return NextResponse.json({ error: 'Too many requests', retryAfterMs }, { status: 429 })

  const result = await createEntry({ userId, body: await request.json().catch(() => ({})) })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
