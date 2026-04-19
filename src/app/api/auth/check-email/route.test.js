import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthUser, select } from '@api/_lib/supabase.js'
import { POST } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  getAuthUser: vi.fn(),
  select: vi.fn(),
}))

function request(email, ip = '127.0.0.1') {
  return new Request('http://localhost/api/auth/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify({ email }),
  })
}

describe('check-email route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns SSO provider details for SSO accounts', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-1', totp_secret: null }] })
    getAuthUser.mockResolvedValueOnce({
      data: {
        app_metadata: { provider: 'google' },
        identities: [{ provider: 'email' }, { provider: 'google' }],
      },
    })

    const response = await POST(request('Ada@Example.com'))
    const data = await response.json()

    expect(data).toEqual({ exists: true, hasMfa: false, hasSso: true, ssoProvider: 'google' })
    expect(getAuthUser).toHaveBeenCalledWith('user-1')
  })

  it('returns OTP account details for non-SSO accounts', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-2', totp_secret: null }] })
    getAuthUser.mockResolvedValueOnce({
      data: {
        app_metadata: { provider: 'email' },
        identities: [{ provider: 'email' }],
      },
    })

    const response = await POST(request('otp@example.com', '127.0.0.2'))
    const data = await response.json()

    expect(data).toEqual({ exists: true, hasMfa: false, hasSso: false, ssoProvider: null })
  })

  it('does not fetch auth user when no profile exists', async () => {
    select.mockResolvedValueOnce({ data: [] })

    const response = await POST(request('new@example.com', '127.0.0.3'))
    const data = await response.json()

    expect(data).toEqual({ exists: false, hasMfa: false, hasSso: false, ssoProvider: null })
    expect(getAuthUser).not.toHaveBeenCalled()
  })
})
