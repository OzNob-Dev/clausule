import { beforeEach, describe, expect, it, vi } from 'vitest'
import { appendSessionCookies, createPersistentSession } from './session'

vi.mock('./jwt', () => ({
  ACCESS_TOKEN_TTL_S: 60,
  REFRESH_TOKEN_TTL_S: 60,
  generateRefreshToken: vi.fn(() => ({ token: 'refresh-token', hash: 'refresh-hash' })),
  signAccessToken: vi.fn(() => 'access-token'),
}))

vi.mock('./supabase', () => ({
  insert: vi.fn(async () => ({ error: null })),
}))

describe('session helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a persistent session', async () => {
    const session = await createPersistentSession({ userId: 'user-1', email: 'ada@example.com', role: 'employee' })

    expect(session).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' })
  })

  it('appends cookies to a response', () => {
    const response = new Response()
    appendSessionCookies(response, { accessToken: 'a', refreshToken: 'r' })

    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('set-cookie')).toContain('session')
  })
})
