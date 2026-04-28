import crypto from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { select, update } from '@api/_lib/supabase.js'
import { consumePasskeyAuthChallenge, storePasskeyAuthChallenge } from './passkeyChallenge.js'
import {
  createPasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
} from './passkeyAuthentication.js'

vi.mock('@api/_lib/supabase.js', () => ({
  select: vi.fn(),
  update: vi.fn(),
}))

vi.mock('./passkeyChallenge.js', () => ({
  storePasskeyAuthChallenge: vi.fn(),
  consumePasskeyAuthChallenge: vi.fn(),
}))

function request(host = 'app.example.com') {
  return new Request('https://app.example.com/api/auth/passkeys/authenticate/options', {
    headers: { host },
  })
}

function cborHead(major, value) {
  if (value < 24) return Buffer.from([(major << 5) | value])
  if (value < 256) return Buffer.from([(major << 5) | 24, value])
  if (value < 65536) {
    const out = Buffer.alloc(3)
    out[0] = (major << 5) | 25
    out.writeUInt16BE(value, 1)
    return out
  }
  const out = Buffer.alloc(5)
  out[0] = (major << 5) | 26
  out.writeUInt32BE(value, 1)
  return out
}

function cborInt(value) {
  return value >= 0 ? cborHead(0, value) : cborHead(1, -1 - value)
}

function cborBytes(value) {
  return Buffer.concat([cborHead(2, value.length), value])
}

function cborMap(entries) {
  return Buffer.concat([
    cborHead(5, entries.length),
    ...entries.flatMap(([key, value]) => [cborInt(key), Buffer.isBuffer(value) ? cborBytes(value) : cborInt(value)]),
  ])
}

function coseEcPublicKey(publicKey) {
  const jwk = publicKey.export({ format: 'jwk' })
  return cborMap([
    [1, 2],
    [3, -7],
    [-1, 1],
    [-2, Buffer.from(jwk.x, 'base64url')],
    [-3, Buffer.from(jwk.y, 'base64url')],
  ]).toString('base64')
}

function passkeyAssertion({ privateKey, rpId, origin, challenge, credentialId = 'cred-1', signCount = 1, userId = 'user-1' }) {
  const clientDataJSON = Buffer.from(JSON.stringify({
    type: 'webauthn.get',
    challenge,
    origin,
  }))
  const authenticatorData = Buffer.concat([
    crypto.createHash('sha256').update(rpId).digest(),
    Buffer.from([0x05]),
    Buffer.from([0x00, 0x00, 0x00, signCount]),
  ])
  const signature = crypto.sign(
    'sha256',
    Buffer.concat([authenticatorData, crypto.createHash('sha256').update(clientDataJSON).digest()]),
    privateKey,
  )

  return {
    id: credentialId,
    rawId: credentialId,
    response: {
      clientDataJSON: clientDataJSON.toString('base64url'),
      authenticatorData: authenticatorData.toString('base64url'),
      signature: signature.toString('base64url'),
      userHandle: Buffer.from(userId).toString('base64url'),
    },
  }
}

describe('passkeyAuthentication service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.WEBAUTHN_CHALLENGE_SECRET = 'test-secret'
    delete process.env.NEXT_PUBLIC_RP_ID
    delete process.env.NEXT_PUBLIC_ORIGIN
    storePasskeyAuthChallenge.mockResolvedValue({ data: [{ challenge: 'stored' }], error: null })
    consumePasskeyAuthChallenge.mockResolvedValue({
      row: { challenge: 'stored', expires_at: new Date(Date.now() + 60_000).toISOString() },
      error: null,
    })
  })

  it('creates authentication options and stores a signed challenge', async () => {
    const result = await createPasskeyAuthenticationOptions({ request: request() })

    expect(result.status).toBe(200)
    expect(result.body.options.rpId).toBe('app.example.com')
    expect(result.body.options.userVerification).toBe('required')
    expect(result.body._signedChallenge).toContain('.')
    expect(storePasskeyAuthChallenge).toHaveBeenCalledWith({
      challenge: result.body._signedChallenge,
      expiresAt: expect.any(String),
    })
  })

  it('requires explicit WebAuthn production config outside local origins', async () => {
    const nodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const result = await createPasskeyAuthenticationOptions({ request: request('app.example.com') })

    process.env.NODE_ENV = nodeEnv
    expect(result.status).toBe(500)
    expect(result.body).toEqual({ error: 'Passkey configuration is incomplete' })
  })

  it('verifies a valid assertion and returns a passkey session', async () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
    const options = await createPasskeyAuthenticationOptions({ request: request() })
    const challenge = options.body.options.challenge
    const signedChallenge = options.body._signedChallenge
    const credential = passkeyAssertion({
      privateKey,
      rpId: 'app.example.com',
      origin: 'https://app.example.com',
      challenge,
    })

    consumePasskeyAuthChallenge.mockResolvedValueOnce({
      row: { challenge: signedChallenge, expires_at: new Date(Date.now() + 60_000).toISOString() },
      error: null,
    })
    select
      .mockResolvedValueOnce({
        data: [{
          id: 'device-1',
          user_id: 'user-1',
          public_key_cose: coseEcPublicKey(publicKey),
          sign_count: 0,
        }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{
          id: 'user-1',
          email: 'ada@example.com',
          role: 'employee',
          is_active: true,
          is_deleted: false,
        }],
        error: null,
      })
      .mockResolvedValueOnce({ data: [{ id: 'sub-1' }], error: null })
    update
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [{ id: 'device-1' }], error: null })

    const result = await verifyPasskeyAuthentication({
      request: request(),
      body: {
        credential,
        _signedChallenge: signedChallenge,
      },
    })

    expect(result.status).toBe(200)
    expect(result.body).toEqual({ ok: true, role: 'employee' })
    expect(result.session).toEqual({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'passkey',
    })
  })

  it('rejects a stale or replayed sign counter', async () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
    const options = await createPasskeyAuthenticationOptions({ request: request() })
    const signedChallenge = options.body._signedChallenge

    select
      .mockResolvedValueOnce({
        data: [{
          id: 'device-1',
          user_id: 'user-1',
          public_key_cose: coseEcPublicKey(publicKey),
          sign_count: 3,
        }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{
          id: 'user-1',
          email: 'ada@example.com',
          role: 'employee',
          is_active: true,
          is_deleted: false,
        }],
        error: null,
      })
      .mockResolvedValueOnce({ data: [{ id: 'sub-1' }], error: null })

    const result = await verifyPasskeyAuthentication({
      request: request(),
      body: {
        credential: passkeyAssertion({
          privateKey,
          rpId: 'app.example.com',
          origin: 'https://app.example.com',
          challenge: options.body.options.challenge,
          signCount: 3,
        }),
        _signedChallenge: signedChallenge,
      },
    })

    expect(result).toEqual({
      body: { error: 'Invalid passkey' },
      status: 401,
    })
  })
})
