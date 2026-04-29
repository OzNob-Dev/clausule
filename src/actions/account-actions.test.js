import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveProfileAction, deleteAccountAction } from './account-actions.js'

vi.mock('next/headers', () => ({
  headers: () => ({ get: () => 'clausule_at=token' }),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  getAuthUser: vi.fn(),
  updateAuthUser: vi.fn(),
  update: vi.fn(),
  del: vi.fn(),
}))

vi.mock('@auth/server/accountRepository.js', () => ({
  findProfileById: vi.fn(),
}))

vi.mock('@auth/server/emailOtpVerification.js', () => ({
  verifyEmailOtpCode: vi.fn(),
}))

import { requireActiveAuth } from '@api/_lib/auth.js'
import { getAuthUser, updateAuthUser, update, del } from '@api/_lib/supabase.js'
import { findProfileById } from '@auth/server/accountRepository.js'
import { verifyEmailOtpCode } from '@auth/server/emailOtpVerification.js'

describe('account actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    findProfileById.mockResolvedValue({ profile: { email: 'old@example.com', mobile: '', role: 'employee' }, error: null })
    verifyEmailOtpCode.mockResolvedValue({ ok: true })
    updateAuthUser.mockResolvedValue({ error: null })
    update.mockResolvedValue({ data: [{ first_name: 'Ada', last_name: null, email: 'new@example.com', mobile: '+123', job_title: null, department: null }], error: null })
    getAuthUser.mockResolvedValue({ data: { user: { email: 'new@example.com' } }, error: null })
    del.mockResolvedValue({ data: null, error: null })
  })

  it('saves the profile after validating email and mobile changes', async () => {
    const result = await saveProfileAction({
      firstName: 'Ada',
      lastName: '',
      email: 'New@Example.com',
      mobile: '+123',
      jobTitle: '',
      department: '',
      emailVerificationCode: '123456',
      mobileConfirmed: true,
      mobileConfirmation: '+123',
    })

    expect(result).toEqual({
      ok: true,
      user: { id: 'user-1', email: 'new@example.com', role: 'employee' },
      profile: { firstName: 'Ada', lastName: '', email: 'new@example.com', mobile: '+123', jobTitle: '', department: '' },
    })
    expect(verifyEmailOtpCode).toHaveBeenCalledWith('new@example.com', '123456')
    expect(updateAuthUser).toHaveBeenCalledWith('user-1', { email: 'new@example.com' })
  })

  it('deletes the account and refresh tokens', async () => {
    await deleteAccountAction()

    expect(update).toHaveBeenCalledWith('profiles', 'id=eq.user-1', expect.objectContaining({
      is_active: false,
      is_deleted: true,
      deleted_at: expect.any(String),
    }), { expectRows: 'single' })
    expect(del).toHaveBeenCalledWith('refresh_tokens', 'user_id=eq.user-1')
  })
})
