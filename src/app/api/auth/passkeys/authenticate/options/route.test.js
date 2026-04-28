import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPasskeyAuthenticationOptions } from '@auth/server/passkeyAuthentication.js'
import { POST } from './route.js'

vi.mock('@auth/server/passkeyAuthentication.js', () => ({
  createPasskeyAuthenticationOptions: vi.fn(),
}))

describe('passkeys/authenticate/options route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createPasskeyAuthenticationOptions.mockResolvedValue({
      body: { options: { challenge: 'challenge' }, _signedChallenge: 'signed.challenge' },
      status: 200,
    })
  })

  it('returns passkey authentication options without prior auth', async () => {
    const response = await POST(new Request('http://localhost/api/auth/passkeys/authenticate/options', { method: 'POST' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ options: { challenge: 'challenge' }, _signedChallenge: 'signed.challenge' })
  })
})
