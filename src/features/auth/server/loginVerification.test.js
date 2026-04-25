import { beforeEach, describe, expect, it, vi } from 'vitest'
import { verifyTotp } from '@api/_lib/totp.js'
import { findProfileByEmail, getUserSsoProvider, hasActiveSubscription } from './accountRepository.js'
import { verifyEmailOtpCode } from './emailOtpVerification.js'
import { verifyEmailOtpLogin, verifyTotpLogin } from './loginVerification.js'

vi.mock('@api/_lib/totp.js', () => ({
  verifyTotp: vi.fn(),
}))

vi.mock('./accountRepository.js', () => ({
  accountActive: vi.fn((profile, hasPaid) => Boolean(profile?.is_active) || hasPaid),
  findProfileByEmail: vi.fn(),
  getUserSsoProvider: vi.fn(),
  hasActiveSubscription: vi.fn(),
}))

vi.mock('./emailOtpVerification.js', () => ({
  verifyEmailOtpCode: vi.fn(),
}))

describe('loginVerification service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    verifyEmailOtpCode.mockResolvedValue({ ok: true })
    getUserSsoProvider.mockResolvedValue({ provider: null, error: null })
    hasActiveSubscription.mockResolvedValue({ hasPaid: false, error: null })
  })

  it('allows TOTP sign-in for paid accounts that are inactive in the profile row', async () => {
    findProfileByEmail.mockResolvedValue({
      profile: {
        id: 'user-1',
        role: 'employee',
        totp_secret: 'SECRET',
        is_active: false,
        is_deleted: false,
      },
      error: null,
    })
    hasActiveSubscription.mockResolvedValueOnce({ hasPaid: true, error: null })
    verifyTotp.mockReturnValueOnce(true)

    const result = await verifyTotpLogin({ email: 'ada@example.com', code: '123456' })

    expect(result).toEqual({
      body: { ok: true, role: 'employee' },
      status: 200,
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'totp' },
    })
  })

  it('still routes inactive unpaid OTP accounts back to signup', async () => {
    findProfileByEmail.mockResolvedValue({
      profile: {
        id: 'user-1',
        role: 'employee',
        totp_secret: null,
        is_active: false,
        is_deleted: false,
      },
      error: null,
    })

    const result = await verifyEmailOtpLogin({ email: 'ada@example.com', code: '123456' })

    expect(result).toEqual({
      body: {
        ok: true,
        nextStep: 'signup',
        verificationToken: expect.any(String),
      },
      status: 200,
    })
  })
})
