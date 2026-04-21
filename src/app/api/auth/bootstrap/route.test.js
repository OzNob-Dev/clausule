import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuth } from '@api/_lib/auth.js'
import { getAuthUser, select } from '@api/_lib/supabase.js'
import { GET } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireAuth: vi.fn(),
  unauthorized: vi.fn((message = 'Unauthenticated') => Response.json({ error: message }, { status: 401 })),
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
    requireAuth.mockReturnValue({
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
})
