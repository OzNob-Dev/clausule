import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route.js'

vi.mock('@features/auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(async () => ({ allowed: true, retryAfterMs: 0, error: null })),
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

  it('returns a generic continuation step for valid emails', async () => {
    const response = await POST(request('Ada@Example.com'))
    const data = await response.json()

    expect(data).toEqual({ nextStep: 'continue' })
  })

  it('rejects malformed emails', async () => {
    const response = await POST(request('not-an-email'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid email' })
  })
})
