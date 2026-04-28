import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeDistributedRateLimit } from '@auth/server/distributedRateLimit.js'
import { sendOtpCode } from '@auth/server/sendOtpCode.js'
import { POST } from './route.js'

vi.mock('@auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(),
}))

vi.mock('@auth/server/sendOtpCode.js', () => ({
  sendOtpCode: vi.fn(),
}))

function request(email = 'Ada@Example.com') {
  return new Request('http://localhost/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

describe('send-code route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    consumeDistributedRateLimit.mockResolvedValue({ allowed: true, retryAfterMs: 0, error: null })
    sendOtpCode.mockResolvedValue({ body: { ok: true }, status: 200 })
  })

  it('uses the distributed limiter before sending an OTP', async () => {
    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })
    expect(consumeDistributedRateLimit).toHaveBeenCalledWith({
      scope: 'auth_send_code_email',
      identifier: 'ada@example.com',
      limit: 3,
      windowMs: 10 * 60 * 1000,
    })
    expect(sendOtpCode).toHaveBeenCalledWith({ email: 'ada@example.com' })
  })

  it('returns 429 when the distributed limiter blocks the request', async () => {
    consumeDistributedRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterMs: 30_000, error: null })

    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data).toEqual({ error: 'Too many requests — please try again later', retryAfterMs: 30_000 })
    expect(sendOtpCode).not.toHaveBeenCalled()
  })
})
