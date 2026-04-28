'use server'

import { headers } from 'next/headers'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { consumeDistributedRateLimit } from '@auth/server/distributedRateLimit.js'
import { draftSummaryText } from '@lib/api/anthropic.js'

function requestFromHeaders() {
  const cookie = headers().get('cookie') ?? ''
  return new Request('http://localhost', { headers: cookie ? { cookie } : {} })
}

export async function draftSummaryAction(employeeName, entries) {
  const request = requestFromHeaders()
  const auth = await requireActiveAuth(request)
  if (auth.error) throw new Error(auth.error)

  const { allowed, retryAfterMs, error } = await consumeDistributedRateLimit({
    scope: 'ai_draft_summary_user',
    identifier: auth.userId,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (error) throw new Error('AI request failed')
  if (!allowed) throw new Error(retryAfterMs ? 'Too many requests' : 'AI request failed')

  return draftSummaryText({ employeeName, entries })
}
