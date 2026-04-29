import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { verifyPasskeyRegistration } from '@auth/server/passkeyRegistration.js'
import { POST } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message }, { status: 401 })),
}))

vi.mock('@auth/server/passkeyRegistration.js', () => ({
  verifyPasskeyRegistration: vi.fn(),
}))

describe('passkeys/register/verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    verifyPasskeyRegistration.mockResolvedValue({ body: { ok: true }, status: 200, log: null })
  })

  it('verifies a registration and returns the service response', async () => {
    const response = await POST(new Request('http://localhost/api/auth/passkeys/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: { rawId: 'cred-1' }, _signedChallenge: 'signed.challenge' }),
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(verifyPasskeyRegistration).toHaveBeenCalledWith({
      request: expect.any(Request),
      userId: 'user-1',
      body: { credential: { rawId: 'cred-1' }, _signedChallenge: 'signed.challenge' },
    })
  })

  it('returns a safe error when verification throws', async () => {
    verifyPasskeyRegistration.mockRejectedValueOnce(new Error('boom'))

    const response = await POST(new Request('http://localhost/api/auth/passkeys/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: { rawId: 'cred-1' }, _signedChallenge: 'signed.challenge' }),
    }))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to verify passkey' })
  })
})
