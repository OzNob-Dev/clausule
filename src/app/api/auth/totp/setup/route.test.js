import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

const { requireActiveAuth, authErrorResponse, createTotpSetup, saveTotpSetup } = vi.hoisted(() => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message) => Response.json({ error: message }, { status: 401 })),
  createTotpSetup: vi.fn(),
  saveTotpSetup: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth,
  authErrorResponse,
}))

vi.mock('@auth/server/totpSetup.js', () => ({
  createTotpSetup,
  saveTotpSetup,
}))

describe('auth totp setup route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('returns the setup payload on GET', async () => {
    createTotpSetup.mockResolvedValueOnce({ status: 200, body: { secret: 'ABC', uri: 'otpauth://totp/abc' } })

    const response = await GET(new Request('http://localhost/api/auth/totp/setup'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ secret: 'ABC', uri: 'otpauth://totp/abc' })
  })

  it('returns the auth error when unauthenticated', async () => {
    requireActiveAuth.mockResolvedValueOnce({ error: 'Unauthenticated' })

    const response = await POST(new Request('http://localhost/api/auth/totp/setup', { method: 'POST', body: '{}' }))

    expect(authErrorResponse).toHaveBeenCalledWith('Unauthenticated')
    expect(response.status).toBe(401)
  })

  it('verifies and saves the totp secret on POST', async () => {
    saveTotpSetup.mockResolvedValueOnce({ status: 200, body: { ok: true } })

    const response = await POST(new Request('http://localhost/api/auth/totp/setup', { method: 'POST', body: JSON.stringify({ code: '123456', secret: 'ABC' }) }))

    expect(saveTotpSetup).toHaveBeenCalledWith({ userId: 'user-1', body: { code: '123456', secret: 'ABC' } })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })
})
