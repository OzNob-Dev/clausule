import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getServerAuth, getServerBootstrapSession } from './serverSession.js'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  requireActiveAuthProfile: vi.fn(),
}))

vi.mock('@auth/server/bootstrapSession.js', () => ({
  bootstrapSession: vi.fn(),
  BOOTSTRAP_PROFILE_FIELDS: 'id,is_active,is_deleted,first_name,last_name,email,mobile,job_title,department,totp_secret',
}))

vi.mock('@shared/utils/authTestBypass.js', () => ({
  isAuthTestBypassEnabled: vi.fn(),
  authTestBypassBootstrap: { user: { id: 'auth-test-employee', email: 'employee.test@clausule.app', role: 'employee' } },
  authTestBypassUser: { id: 'auth-test-employee', email: 'employee.test@clausule.app', role: 'employee', authMethod: 'otp' },
}))

import { cookies } from 'next/headers'
import { requireActiveAuth, requireActiveAuthProfile } from '@api/_lib/auth.js'
import { bootstrapSession } from '@auth/server/bootstrapSession.js'
import { isAuthTestBypassEnabled } from '@shared/utils/authTestBypass.js'

describe('serverSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookies.mockResolvedValue({ toString: () => 'clausule_at=token' })
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    requireActiveAuthProfile.mockResolvedValue({ userId: 'user-1', profile: { id: 'user-1' }, error: null })
    bootstrapSession.mockResolvedValue({ status: 200, body: { user: { id: 'user-1' } } })
    isAuthTestBypassEnabled.mockReturnValue(false)
  })

  it('reads auth from cookies and returns bypass bootstrap when enabled', async () => {
    await expect(getServerAuth()).resolves.toEqual({ userId: 'user-1', error: null })
    await expect(getServerBootstrapSession()).resolves.toEqual({ user: { id: 'user-1' } })
    isAuthTestBypassEnabled.mockReturnValue(true)
    await expect(getServerBootstrapSession()).resolves.toEqual({ user: { id: 'auth-test-employee', email: 'employee.test@clausule.app', role: 'employee' } })
  })
})
