import crypto from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { select, update } from '@api/_lib/supabase.js'
import { POST } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  select: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

function request(email = 'Ada@Example.com', code = '123456') {
  return new Request('http://localhost/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
}

function codeHash(code) {
  const salt = 'test-salt'
  const hash = crypto.createHmac('sha256', salt).update(code).digest('hex')
  return `${salt}:${hash}`
}

describe('verify-code route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    update.mockResolvedValue({ data: [] })
  })

  it('loads the profile case-insensitively after a valid OTP', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'otp-1', code_hash: codeHash('123456') }] })
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee' }] })

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(select).toHaveBeenNthCalledWith(2, 'profiles', 'email=ilike.ada%40example.com&select=id%2Crole&limit=1')
    expect(update).toHaveBeenCalledWith('otp_codes', 'id=eq.otp-1', expect.objectContaining({ used_at: expect.any(String) }))
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'otp',
    })
  })
})
