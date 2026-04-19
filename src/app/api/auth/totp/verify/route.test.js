import crypto from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const SECRET = 'JBSWY3DPEHPK3PXP'

function base32Decode(input) {
  const bytes = []
  let buffer = 0
  let bitsLeft = 0
  for (const char of input.toUpperCase().replace(/=+$/, '')) {
    const value = BASE32_CHARS.indexOf(char)
    if (value === -1) continue
    buffer = (buffer << 5) | value
    bitsLeft += 5
    if (bitsLeft >= 8) {
      bitsLeft -= 8
      bytes.push((buffer >> bitsLeft) & 0xff)
    }
  }
  return Buffer.from(bytes)
}

function totpCode(secret, counter) {
  const message = Buffer.alloc(8)
  let c = counter
  for (let i = 7; i >= 0; i--) {
    message[i] = c & 0xff
    c = Math.floor(c / 256)
  }
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(message).digest()
  const offset = hmac[19] & 0x0f
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
     (hmac[offset + 3] & 0xff)
  return String(code % 1_000_000).padStart(6, '0')
}

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
