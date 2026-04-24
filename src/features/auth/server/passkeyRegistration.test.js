import crypto from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insert, select } from '@api/_lib/supabase.js'
import {
  createPasskeyRegistrationOptions,
  pendingChallenges,
  verifyPasskeyRegistration,
} from './passkeyRegistration.js'

vi.mock('@api/_lib/supabase.js', () => ({
  insert: vi.fn(),
  select: vi.fn(),
}))

function request(host = 'app.example.com') {
  return new Request('https://app.example.com/api/auth/passkeys/register/options', {
    headers: { host },
  })
}

describe('passkeyRegistration service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pendingChallenges.clear()
    process.env.WEBAUTHN_CHALLENGE_SECRET = 'test-secret'
    delete process.env.NEXT_PUBLIC_RP_ID
    delete process.env.NEXT_PUBLIC_ORIGIN
  })

  it('creates registration options and stores a signed challenge', async () => {
    select.mockResolvedValueOnce({
      data: [{ email: 'ada@example.com', first_name: 'Ada', last_name: 'Lovelace' }],
    })

    const result = await createPasskeyRegistrationOptions({ request: request(), userId: 'user-1' })

    expect(result.status).toBe(200)
    expect(result.body.options.rp).toEqual({ id: 'app.example.com', name: 'Clausule' })
    expect(result.body.options.user.name).toBe('ada@example.com')
    expect(result.body.options.user.displayName).toBe('Ada Lovelace')
    expect(result.body._signedChallenge).toContain('.')
    expect(pendingChallenges.get('user-1')).toEqual(expect.objectContaining({
      challenge: result.body._signedChallenge,
      expiresAt: expect.any(Number),
    }))
  })

  it('rejects verification without a credential or signed challenge', async () => {
    const result = await verifyPasskeyRegistration({
      request: request(),
      userId: 'user-1',
      body: {},
    })

    expect(result).toEqual({
      body: { error: 'credential and _signedChallenge required' },
      status: 400,
    })
  })

  it('returns a safe server error when passkey persistence fails', async () => {
    select.mockResolvedValueOnce({
      data: [{ email: 'ada@example.com', first_name: 'Ada', last_name: 'Lovelace' }],
    })
    const options = await createPasskeyRegistrationOptions({ request: request(), userId: 'user-1' })
    const signedChallenge = options.body._signedChallenge
    const challenge = options.body.options.challenge
    insert.mockResolvedValueOnce({ data: null, error: { message: 'duplicate internal detail' } })

    const result = await verifyPasskeyRegistration({
      request: request(),
      userId: 'user-1',
      body: {
        _signedChallenge: signedChallenge,
        credential: {
          response: {
            clientDataJSON: Buffer.from(JSON.stringify({
              type: 'webauthn.create',
              challenge,
              origin: 'https://app.example.com',
            })).toString('base64url'),
            authenticatorData: Buffer.concat([
              crypto.createHash('sha256').update('app.example.com').digest(),
              Buffer.from([0x45]),
              Buffer.alloc(20),
              Buffer.from([0x00, 0x04]),
              Buffer.from('abcd'),
              Buffer.from('key'),
            ]).toString('base64url'),
          },
        },
      },
    })

    expect(result.status).toBe(500)
    expect(result.body).toEqual({ error: 'Failed to save passkey' })
  })
})
