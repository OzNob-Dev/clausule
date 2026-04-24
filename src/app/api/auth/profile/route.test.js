import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { getAuthUser, select, update, updateAuthUser } from '@api/_lib/supabase.js'
import { findProfileById } from '@features/auth/server/accountRepository.js'
import { verifyEmailOtpCode } from '@features/auth/server/emailOtpVerification.js'
import { GET, PATCH } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  getAuthUser: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  updateAuthUser: vi.fn(),
}))

vi.mock('@features/auth/server/accountRepository.js', () => ({
  findProfileById: vi.fn(),
}))

vi.mock('@features/auth/server/emailOtpVerification.js', () => ({
  verifyEmailOtpCode: vi.fn(),
}))

describe('auth profile route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    select.mockResolvedValue({
      data: [{
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        mobile: '+61 400 000 000',
        job_title: 'Engineer',
        department: 'Platform',
      }],
      error: null,
    })
    getAuthUser.mockResolvedValue({ data: { user_metadata: {} }, error: null })
    findProfileById.mockResolvedValue({
      profile: {
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        mobile: '+61 400 000 000',
        job_title: 'Engineer',
        department: 'Platform',
        role: 'employee',
      },
      error: null,
    })
    verifyEmailOtpCode.mockResolvedValue({ ok: true })
    updateAuthUser.mockResolvedValue({ data: { id: 'user-1' }, error: null })
    update.mockResolvedValue({
      data: [{
        first_name: 'Ada',
        last_name: 'Byron',
        email: 'ada@new.example.com',
        mobile: '+61 411 111 111',
        job_title: 'Principal engineer',
        department: 'Platform',
      }],
      error: null,
    })
  })

  it('returns the contact and work fields', async () => {
    const response = await GET(new Request('http://localhost/api/auth/profile'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      mobile: '+61 400 000 000',
      jobTitle: 'Engineer',
      department: 'Platform',
    })
  })

  it('falls back to auth metadata names when the profile row has blank names', async () => {
    select.mockResolvedValue({
      data: [{
        first_name: '',
        last_name: null,
        email: 'postbox.adrian+8@gmail.com',
        mobile: '',
        job_title: null,
        department: null,
      }],
      error: null,
    })
    getAuthUser.mockResolvedValue({
      data: { user_metadata: { first_name: 'awerwer', last_name: 'sadfasd' } },
      error: null,
    })

    const response = await GET(new Request('http://localhost/api/auth/profile'))
    const json = await response.json()

    expect(json.firstName).toBe('awerwer')
    expect(json.lastName).toBe('sadfasd')
  })

  it('requires email verification and mobile confirmation before saving changed contact details', async () => {
    const response = await PATCH(new Request('http://localhost/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Byron',
        email: 'ada@new.example.com',
        mobile: '+61 411 111 111',
        jobTitle: 'Principal engineer',
        department: 'Platform',
        emailVerificationCode: '123456',
        mobileConfirmed: true,
        mobileConfirmation: '+61 411 111 111',
      }),
    }))
    const json = await response.json()

    expect(verifyEmailOtpCode).toHaveBeenCalledWith('ada@new.example.com', '123456')
    expect(updateAuthUser).toHaveBeenCalledWith('user-1', { email: 'ada@new.example.com' })
    expect(update).toHaveBeenCalledWith('profiles', 'id=eq.user-1', expect.objectContaining({
      first_name: 'Ada',
      last_name: 'Byron',
      email: 'ada@new.example.com',
      mobile: '+61 411 111 111',
      job_title: 'Principal engineer',
      department: 'Platform',
    }), { expectRows: 'single' })
    expect(response.status).toBe(200)
    expect(json.profile).toEqual({
      firstName: 'Ada',
      lastName: 'Byron',
      email: 'ada@new.example.com',
      mobile: '+61 411 111 111',
      jobTitle: 'Principal engineer',
      department: 'Platform',
    })
  })

  it('blocks a mobile change without final confirmation', async () => {
    const response = await PATCH(new Request('http://localhost/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        mobile: '+61 411 111 111',
        jobTitle: 'Engineer',
        department: 'Platform',
        mobileConfirmed: false,
        mobileConfirmation: '',
      }),
    }))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toMatch(/mobile confirmation required/i)
    expect(updateAuthUser).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('rolls back the auth email update when the profile row save fails', async () => {
    update.mockResolvedValueOnce({ data: null, error: { message: 'write failed' } })

    const response = await PATCH(new Request('http://localhost/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: 'Ada',
        lastName: 'Byron',
        email: 'ada@new.example.com',
        mobile: '+61 411 111 111',
        jobTitle: 'Principal engineer',
        department: 'Platform',
        emailVerificationCode: '123456',
        mobileConfirmed: true,
        mobileConfirmation: '+61 411 111 111',
      }),
    }))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: 'Failed to save profile' })
    expect(updateAuthUser).toHaveBeenNthCalledWith(1, 'user-1', { email: 'ada@new.example.com' })
    expect(updateAuthUser).toHaveBeenNthCalledWith(2, 'user-1', { email: 'ada@example.com' })
  })
})
