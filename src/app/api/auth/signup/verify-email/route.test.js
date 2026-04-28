import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeDistributedRateLimit } from '@auth/server/distributedRateLimit.js'
import { verifyEmailOtpCode } from '@auth/server/emailOtpVerification.js'
import { POST } from './route.js'

vi.mock('@auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(),
}))

vi.mock('@auth/server/emailOtpVerification.js', () => ({
  verifyEmailOtpCode: vi.fn(),
}))

function request(body = {}) {
  return new Request('http://localhost/api/auth/signup/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'Ada@Example.com',
      code: '123456',
      ...body,
    }),
  })
}

describe('signup verify-email route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    consumeDistributedRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0, error: null })
    verifyEmailOtpCode.mockResolvedValue({ ok: true })
  })

  it('returns a signup verification token after a valid OTP', async () => {
    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(expect.objectContaining({
      ok: true,
      verificationToken: expect.any(String),
    }))
    expect(verifyEmailOtpCode).toHaveBeenCalledWith('ada@example.com', '123456')
  })
})
