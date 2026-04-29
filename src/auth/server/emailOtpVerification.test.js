import { beforeEach, describe, expect, it, vi } from 'vitest'
import { verifyEmailOtpCode } from './emailOtpVerification.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

import { rpc } from '@api/_lib/supabase.js'

describe('verifyEmailOtpCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rpc.mockResolvedValue({ data: [{ ok: true }], error: null })
  })

  it('accepts a valid code', async () => {
    await expect(verifyEmailOtpCode('ada@example.com', '123456')).resolves.toEqual({ ok: true })
  })
})
