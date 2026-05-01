import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bootstrapSession } from './bootstrapSession.js'

vi.mock('./accountRepository.js', () => ({
  findProfileById: vi.fn(),
  getAuthUserDetails: vi.fn(),
}))

vi.mock('./reconcileProfileEmail.js', () => ({
  reconcileProfileEmail: vi.fn(),
}))

import { findProfileById, getAuthUserDetails } from './accountRepository.js'
import { reconcileProfileEmail } from './reconcileProfileEmail.js'

describe('bootstrapSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findProfileById.mockResolvedValue({ profile: { first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com', mobile: '', job_title: '', department: '', totp_secret: 'secret' }, error: null })
    getAuthUserDetails.mockResolvedValue({ user: { email: 'ada@example.com', user_metadata: { first_name: 'Ada' } }, provider: 'google', error: null })
    reconcileProfileEmail.mockResolvedValue({ email: 'ada@example.com', repaired: false })
  })

  it('builds bootstrap session state', async () => {
    await expect(bootstrapSession({ userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'otp' })).resolves.toMatchObject({
      status: 200,
      body: { security: { authenticatorAppConfigured: true, ssoConfigured: true } },
    })
  })

  it('reuses preloaded profile data when provided', async () => {
    await expect(bootstrapSession({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'otp',
      profile: { first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com', mobile: '', job_title: '', department: '', totp_secret: 'secret' },
    })).resolves.toMatchObject({
      status: 200,
      body: { profile: { firstName: 'Ada', lastName: 'Lovelace' } },
    })

    expect(findProfileById).not.toHaveBeenCalled()
  })
})
