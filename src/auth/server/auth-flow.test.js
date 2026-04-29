import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bootstrapSession } from './bootstrapSession.js'
import { checkEmailAccount } from './checkEmail.js'
import { createSignupUser } from './createSignupUser.js'
import { issueRecoverableSession } from './recoverableSession.js'
import { getServerAuth, getServerBootstrapSession } from './serverSession.js'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  clearAuthCookies: vi.fn(() => ['clausule_at=; Max-Age=0']),
}))

vi.mock('@api/_lib/session.js', () => ({
  appendSessionCookies: vi.fn((response) => response),
  createPersistentSession: vi.fn(async () => ({ accessToken: 'at', refreshToken: 'rt' })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  createUser: vi.fn(),
}))

vi.mock('@auth/server/accountRepository.js', () => ({
  findProfileByEmail: vi.fn(),
  findProfileById: vi.fn(),
  getAuthUserDetails: vi.fn(),
  hasActiveSubscription: vi.fn(),
  getUserSsoProvider: vi.fn(),
  accountActive: vi.fn((profile, hasPaid) => Boolean(profile?.is_active) || hasPaid),
}))

vi.mock('@auth/server/reconcileProfileEmail.js', () => ({
  reconcileProfileEmail: vi.fn(),
}))

vi.mock('@auth/server/signupVerification.js', () => ({
  verifySignupVerificationToken: vi.fn(),
}))

vi.mock('@auth/server/backendOperation.js', () => ({
  beginBackendOperation: vi.fn(),
  completeBackendOperation: vi.fn(),
}))

vi.mock('@shared/utils/authTestBypass.js', () => ({
  isAuthTestBypassEnabled: vi.fn(),
  authTestBypassBootstrap: { user: { id: 'auth-test-employee', email: 'employee.test@clausule.app', role: 'employee' } },
  authTestBypassUser: { id: 'auth-test-employee', email: 'employee.test@clausule.app', role: 'employee', authMethod: 'otp' },
}))

import { cookies } from 'next/headers'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { createUser } from '@api/_lib/supabase.js'
import { beginBackendOperation, completeBackendOperation } from '@auth/server/backendOperation.js'
import { findProfileByEmail, findProfileById, getAuthUserDetails, hasActiveSubscription, getUserSsoProvider } from '@auth/server/accountRepository.js'
import { reconcileProfileEmail } from '@auth/server/reconcileProfileEmail.js'
import { verifySignupVerificationToken } from '@auth/server/signupVerification.js'
import { isAuthTestBypassEnabled } from '@shared/utils/authTestBypass.js'

describe('auth flow helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookies.mockResolvedValue({ toString: () => 'clausule_at=token' })
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'otp', error: null })
    findProfileByEmail.mockResolvedValue({ profile: { id: 'user-1', is_active: true, is_deleted: false, totp_secret: null }, error: null })
    findProfileById.mockResolvedValue({ profile: { first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com', mobile: '', job_title: '', department: '', totp_secret: null, role: 'employee' }, error: null })
    getAuthUserDetails.mockResolvedValue({ user: { email: 'ada@example.com', user_metadata: { first_name: 'Ada' } }, provider: null, error: null })
    hasActiveSubscription.mockResolvedValue({ hasPaid: true, error: null })
    getUserSsoProvider.mockResolvedValue({ provider: null, error: null })
    reconcileProfileEmail.mockResolvedValue({ email: 'ada@example.com', repaired: false })
    verifySignupVerificationToken.mockReturnValue({ ok: true })
    createUser.mockResolvedValue({ data: { id: 'user-2' }, error: null })
    beginBackendOperation.mockResolvedValue({ row: { status: 'started' }, replay: null })
    completeBackendOperation.mockResolvedValue({ data: [{ id: 'op-1' }], error: null })
    isAuthTestBypassEnabled.mockReturnValue(false)
  })

  it('bootstraps session state from profile and auth user records', async () => {
    await expect(bootstrapSession({ userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'otp' })).resolves.toMatchObject({
      status: 200,
      body: {
        user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
        security: { authenticatedWithOtp: true, ssoConfigured: false },
      },
    })
  })

  it('routes check-email and signup creation decisions', async () => {
    await expect(checkEmailAccount('ada@example.com')).resolves.toEqual({ result: { nextStep: 'otp' } })

    verifySignupVerificationToken.mockReturnValueOnce({ ok: false, error: 'bad token' })
    await expect(createSignupUser({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', verificationToken: 'bad' })).resolves.toEqual({ body: { error: 'bad token' }, status: 401 })
  })

  it('issues recoverable sessions and returns bootstrap sessions from bypass', async () => {
    const response = await issueRecoverableSession({
      operationKey: 'op-1',
      operationType: 'register',
      email: 'ada@example.com',
      userId: 'user-1',
      body: { ok: true },
      status: 200,
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee' },
    })

    expect(response.status).toBe(200)
    expect(beginBackendOperation).toHaveBeenCalled()
    expect(completeBackendOperation).toHaveBeenCalled()

    isAuthTestBypassEnabled.mockReturnValue(true)
    await expect(getServerBootstrapSession()).resolves.toEqual({ user: { id: 'auth-test-employee', email: 'employee.test@clausule.app', role: 'employee' } })
  })

  it('reads server auth from cookies when bypass is disabled', async () => {
    await expect(getServerAuth()).resolves.toEqual({ userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'otp', error: null })
    expect(cookies).toHaveBeenCalled()
  })
})
