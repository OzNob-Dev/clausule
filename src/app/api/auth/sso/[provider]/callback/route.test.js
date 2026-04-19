import { beforeEach, describe, expect, it, vi } from 'vitest'
import { select } from '@api/_lib/supabase.js'
import { createPersistentSession } from '@api/_lib/session.js'
import { GET } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  select: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

const stateCookie = encodeURIComponent(JSON.stringify({
  state: 'state-1',
  provider: 'google',
  codeVerifier: 'verifier-1',
}))

function callbackRequest() {
  return new Request('http://localhost/api/auth/sso/google/callback?code=code-1&state=state-1', {
    headers: { cookie: `sso_state=${stateCookie}` },
  })
}

function mockGoogleProfile() {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'google-access-token' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    .mockResolvedValueOnce(new Response(JSON.stringify({
      email: 'Ada@Example.com',
      given_name: 'Ada',
      family_name: 'Lovelace',
      id: 'google-user-1',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
}

describe('Google SSO callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_CLIENT_ID = 'google-client'
    process.env.GOOGLE_CLIENT_SECRET = 'google-secret'
    mockGoogleProfile()
  })

  it('redirects an existing unpaid SSO user to prefilled signup without issuing a session', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', first_name: '', last_name: '' }] })
      .mockResolvedValueOnce({ data: [] })

    const response = await GET(callbackRequest(), { params: { provider: 'google' } })
    const location = new URL(response.headers.get('location'))

    expect(location.pathname).toBe('/signup')
    expect(location.searchParams.get('email')).toBe('ada@example.com')
    expect(location.searchParams.get('firstName')).toBe('Ada')
    expect(location.searchParams.get('lastName')).toBe('Lovelace')
    expect(location.searchParams.get('sso')).toBe('google')
    expect(createPersistentSession).not.toHaveBeenCalled()
  })

  it('issues a session and redirects paid SSO users into the app', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', first_name: 'Ada', last_name: 'Lovelace' }] })
      .mockResolvedValueOnce({ data: [{ id: 'sub-1' }] })

    const response = await GET(callbackRequest(), { params: { provider: 'google' } })
    const location = new URL(response.headers.get('location'))

    expect(location.pathname).toBe('/brag')
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
    })
  })
})
