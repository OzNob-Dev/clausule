import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEntryAction, sendFeedbackAction, listFeedbackThreadsAction, createLinkedInImportAction, updateLinkedInImportAction, publishLinkedInImportAction } from './brag-actions.js'

vi.mock('next/headers', () => ({
  headers: () => ({ get: () => 'clausule_at=token' }),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
}))

vi.mock('@auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(),
}))

vi.mock('@brag/server/entries.js', () => ({
  createEntry: vi.fn(),
}))

vi.mock('@brag/server/appFeedback.js', () => ({
  sendAppFeedback: vi.fn(),
  listAppFeedback: vi.fn(),
}))

vi.mock('@brag/server/linkedinImports.js', () => ({
  createLinkedInImport: vi.fn(),
  updateLinkedInImport: vi.fn(),
  publishLinkedInImport: vi.fn(),
}))

import { requireActiveAuth } from '@api/_lib/auth.js'
import { consumeDistributedRateLimit } from '@auth/server/distributedRateLimit.js'
import { createEntry } from '@brag/server/entries.js'
import { sendAppFeedback, listAppFeedback } from '@brag/server/appFeedback.js'
import { createLinkedInImport, updateLinkedInImport, publishLinkedInImport } from '@brag/server/linkedinImports.js'

describe('brag actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', email: 'ada@example.com', error: null })
    consumeDistributedRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0, error: null })
    createEntry.mockResolvedValue({ status: 200, body: { ok: true } })
    sendAppFeedback.mockResolvedValue({ status: 200, body: { feedback: { id: 'feedback-1' } } })
    listAppFeedback.mockResolvedValue({ status: 200, body: { feedback: [{ id: 'thread-1' }] } })
    createLinkedInImport.mockResolvedValue({ status: 200, body: { sessionId: 'li-1' } })
    updateLinkedInImport.mockResolvedValue({ status: 200, body: { ok: true } })
    publishLinkedInImport.mockResolvedValue({ status: 200, body: { ok: true } })
  })

  it('creates a brag entry', async () => {
    await expect(createEntryAction({ title: 'Win' })).resolves.toEqual({ ok: true })
    expect(createEntry).toHaveBeenCalledWith({ userId: 'user-1', body: { title: 'Win' } })
  })

  it('saves feedback and lists feedback threads', async () => {
    await expect(sendFeedbackAction({ subject: 'Idea' })).resolves.toEqual({ id: 'feedback-1' })
    await expect(listFeedbackThreadsAction()).resolves.toEqual([{ id: 'thread-1' }])
  })

  it('handles linkedin import actions', async () => {
    await expect(createLinkedInImportAction()).resolves.toEqual({ sessionId: 'li-1' })
    await expect(updateLinkedInImportAction('li-1', { stage: 'draft' })).resolves.toEqual({ ok: true })
    await expect(publishLinkedInImportAction('li-1')).resolves.toEqual({ ok: true })
  })
})
