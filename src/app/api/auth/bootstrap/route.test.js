import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { getAuthUser, select } from '@api/_lib/supabase.js'
import { GET } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  getAuthUser: vi.fn(),
  select: vi.fn(),
}))

function bootstrapRequest() {
  return new Request('http://localhost/api/auth/bootstrap')
}

describe('auth bootstrap route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS
    requireActiveAuth.mockResolvedValue({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'otp',
      error: null,
    })
    select.mockResolvedValue({
      data: [{
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        mobile: '+61 400 000 000',
        job_title: 'Engineer',
        department: 'Platform',
        totp_secret: null,
      }],
    })
  })

  it('sets SSO state from Supabase Auth identities', async () => {
    getAuthUser.mockResolvedValue({
      data: {
        app_metadata: { provider: 'google' },
        identities: [{ provider: 'email' }, { provider: 'google' }],
      },
    })

    const response = await GET(bootstrapRequest())
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.security).toEqual({
      authenticatorAppConfigured: false,
      authenticatedWithOtp: true,
      ssoConfigured: true,
    })
  })

  it('sets authenticator state from the profile row', async () => {
    select.mockResolvedValue({
      data: [{
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        mobile: '+61 400 000 000',
        job_title: 'Engineer',
        department: 'Platform',
        totp_secret: 'SECRET',
      }],
    })
    getAuthUser.mockResolvedValue({
      data: {
        app_metadata: { provider: 'email' },
        identities: [{ provider: 'email' }],
      },
    })

    const response = await GET(bootstrapRequest())
    const json = await response.json()

    expect(json.security).toEqual({
      authenticatorAppConfigured: true,
      authenticatedWithOtp: true,
      ssoConfigured: false,
    })
  })

  it('keeps authenticated users in the app when the bootstrap lookup fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    select.mockResolvedValue({ data: [], error: new Error('boom') })
    getAuthUser.mockResolvedValue({
      data: {
        app_metadata: { provider: 'email' },
        identities: [{ provider: 'email' }],
      },
    })

    const response = await GET(bootstrapRequest())
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.profile).toEqual({
      firstName: '',
      lastName: '',
      email: 'ada@example.com',
      mobile: '',
      jobTitle: '',
      department: '',
    })
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('falls back to auth metadata names when profile names are blank', async () => {
    select.mockResolvedValue({
      data: [{
        first_name: '',
        last_name: null,
        email: 'postbox.adrian+8@gmail.com',
        mobile: '',
        job_title: null,
        department: null,
        totp_secret: null,
      }],
    })
    getAuthUser.mockResolvedValue({
      data: {
        user_metadata: { first_name: 'awerwer', last_name: 'sadfasd' },
        app_metadata: { provider: 'email' },
        identities: [{ provider: 'email' }],
      },
    })

    const response = await GET(bootstrapRequest())
    const json = await response.json()

    expect(json.profile.firstName).toBe('awerwer')
    expect(json.profile.lastName).toBe('sadfasd')
  })

  it('returns a fake employee bootstrap payload when auth test bypass is enabled', async () => {
    process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS = 'employee'

    const response = await GET(bootstrapRequest())
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      user: {
        id: 'auth-test-employee',
        email: 'employee.test@clausule.app',
        role: 'employee',
      },
      profile: {
        firstName: 'Test',
        lastName: 'Employee',
        email: 'employee.test@clausule.app',
        mobile: '',
        jobTitle: 'QA',
        department: 'Testing',
      },
      security: {
        authenticatorAppConfigured: true,
        authenticatedWithOtp: true,
        ssoConfigured: false,
      },
    })
    expect(requireActiveAuth).not.toHaveBeenCalled()
  })
})
