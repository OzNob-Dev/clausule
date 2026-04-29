import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { createPasskeyRegistrationOptions } from '@auth/server/passkeyRegistration.js'
import { POST } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message }, { status: 401 })),
}))

vi.mock('@auth/server/passkeyRegistration.js', () => ({
  createPasskeyRegistrationOptions: vi.fn(),
}))

describe('passkeys/register/options route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    createPasskeyRegistrationOptions.mockResolvedValue({ body: { options: { challenge: 'challenge' }, _signedChallenge: 'signed.challenge' }, status: 200 })
  })

  it('returns registration options for the authenticated user', async () => {
    const response = await POST(new Request('http://localhost/api/auth/passkeys/register/options', { method: 'POST' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ options: { challenge: 'challenge' }, _signedChallenge: 'signed.challenge' })
    expect(createPasskeyRegistrationOptions).toHaveBeenCalledWith({ request: expect.any(Request), userId: 'user-1' })
  })
})
