import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkEmailAccount } from './checkEmail.js'

vi.mock('./accountRepository.js', () => ({
  findProfileByEmail: vi.fn(),
  hasActiveSubscription: vi.fn(),
  getUserSsoProvider: vi.fn(),
  accountActive: vi.fn((profile, hasPaid) => Boolean(profile?.is_active) || hasPaid),
}))

import { findProfileByEmail, hasActiveSubscription, getUserSsoProvider } from './accountRepository.js'

describe('checkEmailAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findProfileByEmail.mockResolvedValue({ profile: { id: 'user-1', is_active: true, is_deleted: false, totp_secret: null }, error: null })
    hasActiveSubscription.mockResolvedValue({ hasPaid: true, error: null })
    getUserSsoProvider.mockResolvedValue({ provider: null, error: null })
  })

  it('routes active accounts to otp', async () => {
    await expect(checkEmailAccount('ada@example.com')).resolves.toEqual({ result: { nextStep: 'otp' } })
  })
})
