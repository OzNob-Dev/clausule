import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthUser, rpc, select } from '@api/_lib/supabase.js'
import { createPersistentSession } from '@api/_lib/session.js'
import { GET } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  getAuthUser: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

function callbackRequest() {
  return new Request('http://localhost/api/auth/sso/google/callback?code=code-1&state=state-1')
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
    getAuthUser.mockResolvedValue({
      data: { user: { email: 'ada@example.com', app_metadata: { provider: 'google' }, identities: [{ provider: 'google' }] } },
      error: null,
    })
    mockGoogleProfile()
    rpc.mockImplementation(async (fn) => {
      if (fn === 'consume_sso_auth_state') {
        return {
          data: [{
            code_verifier: 'verifier-1',
            redirect_origin: 'http://localhost',
          }],
          error: null,
        }
      }
      if (fn === 'begin_backend_operation') {
        return {
          data: [{
            status: 'started',
            status_code: 200,
            user_id: null,
            session_email: null,
            session_role: null,
            response_body: null,
          }],
          error: null,
        }
      }
      if (fn === 'complete_backend_operation') {
        return {
          data: [{
            status: 'completed',
            status_code: 302,
            user_id: 'user-1',
            session_email: 'ada@example.com',
            session_role: 'employee',
            response_body: { destination: '/brag' },
          }],
          error: null,
        }
      }
      return { data: null, error: null }
    })
  })

  it('redirects an existing unpaid SSO user to prefilled signup without issuing a session', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', first_name: '', last_name: '', is_active: false, is_deleted: false }] })
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
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', first_name: 'Ada', last_name: 'Lovelace', is_active: false, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [{ id: 'sub-1' }] })

    const response = await GET(callbackRequest(), { params: { provider: 'google' } })
    const location = new URL(response.headers.get('location'))

    expect(location.pathname).toBe('/brag')
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'sso',
    })
  })

  it('issues a session for active legacy SSO users without a subscription row', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-2', role: 'employee', first_name: 'Ada', last_name: 'Lovelace', is_active: true, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [] })

    const response = await GET(callbackRequest(), { params: { provider: 'google' } })
    const location = new URL(response.headers.get('location'))

    expect(location.pathname).toBe('/brag')
    expect(select).toHaveBeenNthCalledWith(1, 'profiles', 'email=eq.ada%40example.com&select=id%2Crole%2Cfirst_name%2Clast_name%2Cis_active%2Cis_deleted%2Ctotp_secret&limit=1')
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-2',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'sso',
    })
  })

  it('replays a completed SSO callback after session creation fails once', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', first_name: 'Ada', last_name: 'Lovelace', is_active: true, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [] })
    createPersistentSession
      .mockRejectedValueOnce(new Error('session failed'))
      .mockResolvedValueOnce({ accessToken: 'access-token', refreshToken: 'refresh-token' })

    const first = await GET(callbackRequest(), { params: { provider: 'google' } })

    rpc.mockImplementationOnce(async () => ({
      data: [{
        status: 'completed',
        status_code: 302,
        user_id: 'user-1',
        session_email: 'ada@example.com',
        session_role: 'employee',
        response_body: { destination: '/brag' },
      }],
      error: null,
    }))

    const second = await GET(callbackRequest(), { params: { provider: 'google' } })

    expect(new URL(first.headers.get('location')).searchParams.get('sso_error')).toBe('account_error')
    expect(new URL(second.headers.get('location')).pathname).toBe('/brag')
    expect(select).toHaveBeenCalledTimes(2)
  })
})
