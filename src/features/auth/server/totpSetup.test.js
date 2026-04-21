import { beforeEach, describe, expect, it, vi } from 'vitest'
import { update } from '@api/_lib/supabase.js'
import { verifyTotp } from '@api/_lib/totp.js'
import { saveTotpSetup } from './totpSetup.js'

vi.mock('@api/_lib/supabase.js', () => ({
  update: vi.fn(),
}))

vi.mock('@api/_lib/totp.js', () => ({
  generateBase32Secret: vi.fn(),
  verifyTotp: vi.fn(),
}))

vi.mock('./accountRepository.js', () => ({
  findProfileById: vi.fn(),
}))

describe('saveTotpSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyTotp.mockReturnValue(true)
    update.mockResolvedValue({ error: null })
  })

  it('persists the configured authenticator state to the profile row', async () => {
    const result = await saveTotpSetup({ userId: 'user-1', body: { code: '123456', secret: 'abcd1234' } })

    expect(result).toEqual({ body: { ok: true }, status: 200 })
    expect(update).toHaveBeenCalledWith('profiles', 'id=eq.user-1', { totp_secret: 'ABCD1234' })
  })
})
