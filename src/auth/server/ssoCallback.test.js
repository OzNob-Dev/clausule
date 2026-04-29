import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveSsoCallback } from './ssoCallback.js'

vi.mock('./ssoState.js', () => ({
  consumeSsoAuthState: vi.fn(),
}))

vi.mock('./ssoProviders.js', () => ({
  exchangeSsoCode: vi.fn(),
}))

vi.mock('./accountRepository.js', () => ({
  findProfileByEmail: vi.fn(),
  hasActiveSubscription: vi.fn(),
  getAuthUserDetails: vi.fn(),
  accountActive: vi.fn((profile, hasPaid) => Boolean(profile?.is_active) || hasPaid),
}))

import { consumeSsoAuthState } from './ssoState.js'
import { exchangeSsoCode } from './ssoProviders.js'
import { findProfileByEmail, hasActiveSubscription, getAuthUserDetails } from './accountRepository.js'

describe('resolveSsoCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    consumeSsoAuthState.mockResolvedValue({ row: { code_verifier: 'verifier', redirect_origin: 'http://localhost' }, error: null })
    exchangeSsoCode.mockResolvedValue({ email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' })
    findProfileByEmail.mockResolvedValue({ profile: { id: 'user-1', role: 'employee', is_active: true, is_deleted: false, totp_secret: null }, error: null })
    hasActiveSubscription.mockResolvedValue({ hasPaid: true, error: null })
    getAuthUserDetails.mockResolvedValue({ user: { app_metadata: { provider: 'google' } }, provider: 'google', error: null })
  })

  it('returns a session when the provider and account match', async () => {
    await expect(resolveSsoCallback({ origin: 'http://localhost', provider: 'google', code: 'code', state: 'state', appleUser: null })).resolves.toMatchObject({
      type: 'session',
      destination: '/brag',
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'sso' },
    })
  })
})
