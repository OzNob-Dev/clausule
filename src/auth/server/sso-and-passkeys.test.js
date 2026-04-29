import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSsoStart } from './ssoStart.js'
import { resolveSsoCallback } from './ssoCallback.js'

vi.mock('./ssoState.js', () => ({
  createSsoAuthState: vi.fn(),
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

import { createSsoAuthState, consumeSsoAuthState } from './ssoState.js'
import { exchangeSsoCode } from './ssoProviders.js'
import { findProfileByEmail, hasActiveSubscription, getAuthUserDetails } from './accountRepository.js'

describe('sso flow helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_CLIENT_ID = 'google-client'
    process.env.NODE_ENV = 'development'
    createSsoAuthState.mockResolvedValue({ error: null })
    consumeSsoAuthState.mockResolvedValue({ row: { code_verifier: 'verifier', redirect_origin: 'http://localhost' }, error: null })
    exchangeSsoCode.mockResolvedValue({ email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' })
    findProfileByEmail.mockResolvedValue({ profile: { id: 'user-1', role: 'employee', is_active: true, is_deleted: false, totp_secret: null }, error: null })
    hasActiveSubscription.mockResolvedValue({ hasPaid: true, error: null })
    getAuthUserDetails.mockResolvedValue({ user: { app_metadata: { provider: 'google' } }, provider: 'google', error: null })
  })

  it('builds an SSO start redirect', async () => {
    await expect(createSsoStart({ requestUrl: 'http://localhost/login', provider: 'google' })).resolves.toMatchObject({ redirect: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth') })
    expect(createSsoAuthState).toHaveBeenCalled()
  })

  it('resolves an SSO callback into a session', async () => {
    await expect(resolveSsoCallback({ origin: 'http://localhost', provider: 'google', code: 'code', state: 'state', appleUser: null })).resolves.toMatchObject({
      type: 'session',
      destination: '/brag',
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'sso' },
    })
  })
})
