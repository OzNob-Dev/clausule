'use server'

import { headers } from 'next/headers'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { consumeDistributedRateLimit } from '@auth/server/distributedRateLimit.js'
import { createLinkedInImport, publishLinkedInImport, updateLinkedInImport } from '@brag/server/linkedinImports.js'
import { createEntry as createBragEntry } from '@brag/server/entries.js'
import { listAppFeedback, sendAppFeedback } from '@brag/server/appFeedback.js'

function requestFromHeaders() {
  const cookie = headers().get('cookie') ?? ''
  return new Request('http://localhost', { headers: cookie ? { cookie } : {} })
}

export async function createEntryAction(body) {
  const request = requestFromHeaders()
  const { userId, error } = await requireActiveAuth(request)
  if (error) throw new Error(error)
  const result = await createBragEntry({ userId, body })
  if (result.status >= 400 || result.error) throw new Error(result.body?.error ?? 'Failed to create entry')
  return result.body
}

export async function sendFeedbackAction(body) {
  const request = requestFromHeaders()
  const auth = await requireActiveAuth(request)
  if (auth.error) throw new Error(auth.error)

  const { allowed, retryAfterMs, error } = await consumeDistributedRateLimit({
    scope: 'feedback_post_user',
    identifier: auth.userId,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (error) throw new Error('Failed to save feedback')
  if (!allowed) throw new Error(`Too many requests${retryAfterMs ? ' — please try again later' : ''}`)

  const result = await sendAppFeedback({ body, user: { userId: auth.userId, email: auth.email } })
  if (result.status >= 400 || result.error) throw new Error(result.body?.error ?? 'Failed to save feedback')
  return result.body.feedback
}

export async function listFeedbackThreadsAction() {
  const request = requestFromHeaders()
  const auth = await requireActiveAuth(request)
  if (auth.error) throw new Error(auth.error)

  const result = await listAppFeedback({ userId: auth.userId })
  if (result.status >= 400 || result.error) throw new Error(result.body?.error ?? 'Failed to fetch feedback')
  return result.body.feedback ?? []
}

export async function createLinkedInImportAction() {
  const request = requestFromHeaders()
  const { userId, error } = await requireActiveAuth(request)
  if (error) throw new Error(error)
  const result = await createLinkedInImport({ userId })
  if (result.status >= 400 || result.error) throw new Error(result.body?.error ?? 'Failed to create LinkedIn import')
  return result.body
}

export async function updateLinkedInImportAction(sessionId, body) {
  const request = requestFromHeaders()
  const { userId, error } = await requireActiveAuth(request)
  if (error) throw new Error(error)
  const result = await updateLinkedInImport({ userId, sessionId, body })
  if (result.status >= 400 || result.error) throw new Error(result.body?.error ?? 'Failed to update LinkedIn import')
  return result.body
}

export async function publishLinkedInImportAction(sessionId) {
  const request = requestFromHeaders()
  const { userId, error } = await requireActiveAuth(request)
  if (error) throw new Error(error)
  const result = await publishLinkedInImport({ userId, sessionId })
  if (result.status >= 400 || result.error) throw new Error(result.body?.error ?? 'Failed to publish LinkedIn import')
  return result.body
}
