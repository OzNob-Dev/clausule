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
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-1', totp_secret: null, is_active: true, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [{ id: 'sub-1' }] })
    getAuthUser.mockResolvedValueOnce({
      data: {
        app_metadata: { provider: 'google' },
        identities: [{ provider: 'email' }, { provider: 'google' }],
      },
    })

    const response = await POST(request('Ada@Example.com'))
    const data = await response.json()

    expect(data).toEqual({ exists: true, isActive: true, isDeleted: false, hasMfa: false, hasSso: true, ssoProvider: 'google', hasPaid: true })
    expect(select).toHaveBeenCalledWith('profiles', 'email=ilike.ada%40example.com&select=id%2Ctotp_secret%2Cis_active%2Cis_deleted&limit=1')
    expect(select).toHaveBeenCalledWith('subscriptions', 'user_id=eq.user-1&status=in.%28active%2Ctrialing%29&select=id&limit=1')
    expect(getAuthUser).toHaveBeenCalledWith('user-1')
  })

  it('returns MFA account details for non-SSO accounts', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-2', totp_secret: 'SECRET', is_active: true, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [{ id: 'sub-2' }] })
    getAuthUser.mockResolvedValueOnce({
      data: {
        app_metadata: { provider: 'email' },
        identities: [{ provider: 'email' }],
      },
    })

    const response = await POST(request('otp@example.com', '127.0.0.2'))
    const data = await response.json()

    expect(data).toEqual({ exists: true, isActive: true, isDeleted: false, hasMfa: true, hasSso: false, ssoProvider: null, hasPaid: true })
  })

  it('returns not found for unpaid accounts', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-3', totp_secret: null, is_active: false, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [] })
    getAuthUser.mockResolvedValueOnce({ data: { app_metadata: { provider: 'email' }, identities: [{ provider: 'email' }] } })

    const response = await POST(request('unpaid@example.com', '127.0.0.4'))
    const data = await response.json()

    expect(data).toEqual({ exists: true, isActive: false, isDeleted: false, hasMfa: false, hasSso: false, ssoProvider: null, hasPaid: false })
  })

  it('returns not found for paid accounts without MFA or SSO', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-4', totp_secret: null, is_active: true, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [{ id: 'sub-4' }] })
    getAuthUser.mockResolvedValueOnce({ data: { app_metadata: { provider: 'email' }, identities: [{ provider: 'email' }] } })

    const response = await POST(request('plain@example.com', '127.0.0.6'))
    const data = await response.json()

    expect(data).toEqual({ exists: true, isActive: true, isDeleted: false, hasMfa: false, hasSso: false, ssoProvider: null, hasPaid: true })
  })

  it('returns deleted status for deleted profiles', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-5', totp_secret: 'SECRET', is_active: true, is_deleted: true }] })
      .mockResolvedValueOnce({ data: [{ id: 'sub-5' }] })
    getAuthUser.mockResolvedValueOnce({ data: { app_metadata: { provider: 'email' }, identities: [{ provider: 'email' }] } })

    const response = await POST(request('deleted@example.com', '127.0.0.7'))
    const data = await response.json()

    expect(data).toEqual({ exists: true, isActive: true, isDeleted: true, hasMfa: true, hasSso: false, ssoProvider: null, hasPaid: true })
  })

  it('does not fetch auth user when no profile exists', async () => {
    select.mockResolvedValueOnce({ data: [] })

    const response = await POST(request('new@example.com', '127.0.0.3'))
    const data = await response.json()

    expect(data).toEqual({ exists: false, isActive: false, isDeleted: false, hasMfa: false, hasSso: false, ssoProvider: null, hasPaid: false })
    expect(getAuthUser).not.toHaveBeenCalled()
  })

  it('fails closed when profile lookup fails', async () => {
    select.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })

    const response = await POST(request('ada@example.com', '127.0.0.5'))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Email check failed' })
    expect(getAuthUser).not.toHaveBeenCalled()
  })
})
