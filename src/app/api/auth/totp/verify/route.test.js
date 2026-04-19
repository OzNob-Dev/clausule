import { beforeEach, describe, expect, it, vi } from 'vitest'
import { totpCode } from '@api/_lib/totp.js'
import { createPersistentSession } from '@api/_lib/session.js'
import { select } from '@api/_lib/supabase.js'
import { POST } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  select: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

const SECRET = 'JBSWY3DPEHPK3PXP'

function request(email = 'Ada@Example.com', code = totpCode(SECRET, Math.floor(Date.now() / 1000 / 30))) {
  return new Request('http://localhost/api/auth/totp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
}

describe('totp verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'))
  })

  it('loads the profile case-insensitively and accepts a valid TOTP', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', totp_secret: SECRET }] })

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(select).toHaveBeenCalledWith('profiles', 'email=ilike.ada%40example.com&select=id%2Crole%2Ctotp_secret&limit=1')
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'totp',
    })
  })
})
