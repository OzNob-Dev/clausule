import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth, authErrorResponse } from '@api/_lib/auth.js'
import { GET } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message) => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

describe('auth me route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the authenticated user profile', async () => {
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', email: 'ada@example.com', role: 'employee', error: null })

    const response = await GET(new Request('http://localhost/api/auth/me'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ user: { id: 'user-1', email: 'ada@example.com', role: 'employee' } })
  })

  it('returns token expired without converting it into a generic auth error', async () => {
    requireActiveAuth.mockResolvedValue({ error: 'Token expired' })

    const response = await GET(new Request('http://localhost/api/auth/me'))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Token expired' })
    expect(authErrorResponse).not.toHaveBeenCalled()
  })

  it('delegates other auth failures to the shared error response', async () => {
    requireActiveAuth.mockResolvedValue({ error: 'Auth lookup failed' })

    const response = await GET(new Request('http://localhost/api/auth/me'))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to verify session' })
    expect(authErrorResponse).toHaveBeenCalledWith('Auth lookup failed')
  })
})
