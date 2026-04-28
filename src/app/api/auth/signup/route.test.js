import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeDistributedRateLimit } from '@auth/server/distributedRateLimit.js'
import { createSignupUser } from '@auth/server/createSignupUser.js'
import { POST } from './route.js'

vi.mock('@auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(),
}))

vi.mock('@auth/server/createSignupUser.js', () => ({
  createSignupUser: vi.fn(),
}))

function request(body = {}, ip = '127.0.0.1') {
  return new Request('http://localhost/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify({
      email: 'Ada@Example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      ...body,
    }),
  })
}

describe('signup route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    consumeDistributedRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0, error: null })
    createSignupUser.mockResolvedValue({ body: { ok: true, userId: 'user-1' }, status: 201 })
  })

  it('uses the distributed limiter before creating a signup user', async () => {
    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({ ok: true, userId: 'user-1' })
    expect(consumeDistributedRateLimit).toHaveBeenCalledWith({
      scope: 'auth_signup_ip',
      identifier: '127.0.0.1',
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })
    expect(createSignupUser).toHaveBeenCalledWith({
      email: 'Ada@Example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      verificationToken: undefined,
    })
  })

  it('returns 429 when the distributed limiter blocks the signup', async () => {
    consumeDistributedRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterMs: 60_000, error: null })

    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data).toEqual({ error: 'Too many signup requests', retryAfterMs: 60_000 })
    expect(createSignupUser).not.toHaveBeenCalled()
  })
})
