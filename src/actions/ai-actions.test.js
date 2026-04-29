import { beforeEach, describe, expect, it, vi } from 'vitest'
import { draftSummaryAction } from './ai-actions.js'

vi.mock('next/headers', () => ({
  headers: () => ({ get: () => 'clausule_at=token' }),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
}))

vi.mock('@auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(),
}))

vi.mock('@lib/api/anthropic.js', () => ({
  draftSummaryText: vi.fn(),
}))

import { requireActiveAuth } from '@api/_lib/auth.js'
import { consumeDistributedRateLimit } from '@auth/server/distributedRateLimit.js'
import { draftSummaryText } from '@lib/api/anthropic.js'

describe('ai actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    consumeDistributedRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0, error: null })
    draftSummaryText.mockResolvedValue('summary')
  })

  it('drafts a summary after auth and rate-limit checks', async () => {
    const result = await draftSummaryAction('Ada', [{ id: 'entry-1' }])

    expect(result).toBe('summary')
    expect(draftSummaryText).toHaveBeenCalledWith({ employeeName: 'Ada', entries: [{ id: 'entry-1' }] })
  })

  it('blocks when the rate limit is exceeded', async () => {
    consumeDistributedRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterMs: 1000, error: null })

    await expect(draftSummaryAction('Ada', [])).rejects.toThrow('Too many requests')
  })
})
