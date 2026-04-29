import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeDistributedRateLimit } from './distributedRateLimit.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

import { rpc } from '@api/_lib/supabase.js'

describe('consumeDistributedRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rpc.mockResolvedValue({ data: [{ allowed: true, retry_after_ms: 0 }], error: null })
  })

  it('returns the rate-limit decision', async () => {
    await expect(consumeDistributedRateLimit({ scope: 'x', identifier: 'u', limit: 1, windowMs: 1 })).resolves.toEqual({ allowed: true, retryAfterMs: 0, error: null })
  })
})
