import crypto from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insert, select } from '@api/_lib/supabase.js'
import { consumePasskeyChallenge, storePasskeyChallenge } from './passkeyChallenge.js'
import {
  createPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
} from './passkeyRegistration.js'

vi.mock('@api/_lib/supabase.js', () => ({
  insert: vi.fn(),
  select: vi.fn(),
}))

vi.mock('./passkeyChallenge.js', () => ({
  storePasskeyChallenge: vi.fn(),
  consumePasskeyChallenge: vi.fn(),
}))

function request(host = 'app.example.com') {
  return new Request('https://app.example.com/api/auth/passkeys/register/options', {
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

function cborText(value) {
  const text = Buffer.from(value, 'utf8')
  return Buffer.concat([cborHead(3, text.length), text])
}

function cborBytes(value) {
  return Buffer.concat([cborHead(2, value.length), value])
}

function cborMap(entries) {
  return Buffer.concat([
    cborHead(5, entries.length),
    ...entries.flatMap(([key, value]) => [
      typeof key === 'string' ? cborText(key) : Buffer.from(key),
      value,
    ]),
  ])
}

function attestationObject({ rpId, credentialId = 'abcd', coseKey = 'key', fmt = 'none' }) {
  const authData = Buffer.concat([
    crypto.createHash('sha256').update(rpId).digest(),
    Buffer.from([0x45]),
    Buffer.alloc(20),
    Buffer.from([0x00, credentialId.length]),
    Buffer.from(credentialId),
    Buffer.from(coseKey),
  ])

  return cborMap([
    ['fmt', cborText(fmt)],
    ['attStmt', cborMap([])],
    ['authData', cborBytes(authData)],
  ]).toString('base64url')
}

function webauthnCredentialId(value = 'abcd') {
  return Buffer.from(value).toString('base64url')
}

describe('passkeyRegistration service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.WEBAUTHN_CHALLENGE_SECRET = 'test-secret'
    delete process.env.NEXT_PUBLIC_RP_ID
    delete process.env.NEXT_PUBLIC_ORIGIN
    storePasskeyChallenge.mockResolvedValue({ data: [{ user_id: 'user-1' }], error: null })
    consumePasskeyChallenge.mockResolvedValue({ row: { challenge: 'stored', expires_at: new Date(Date.now() + 60_000).toISOString() }, error: null })
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
    expect(storePasskeyChallenge).toHaveBeenCalledWith({
      userId: 'user-1',
      challenge: result.body._signedChallenge,
      expiresAt: expect.any(String),
    })
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
    consumePasskeyChallenge.mockResolvedValueOnce({
      row: { challenge: signedChallenge, expires_at: new Date(Date.now() + 60_000).toISOString() },
      error: null,
    })

    const result = await verifyPasskeyRegistration({
      request: request(),
      userId: 'user-1',
      body: {
        _signedChallenge: signedChallenge,
        credential: {
          id: webauthnCredentialId(),
          rawId: webauthnCredentialId(),
          response: {
            clientDataJSON: Buffer.from(JSON.stringify({
              type: 'webauthn.create',
              challenge,
              origin: 'https://app.example.com',
            })).toString('base64url'),
            attestationObject: attestationObject({ rpId: 'app.example.com' }),
          },
        },
      },
    })

    expect(result.status).toBe(500)
    expect(result.body).toEqual({ error: 'Failed to save passkey' })
  })

  it('rejects an unsupported attestation format', async () => {
    select.mockResolvedValueOnce({
      data: [{ email: 'ada@example.com', first_name: 'Ada', last_name: 'Lovelace' }],
    })
    const options = await createPasskeyRegistrationOptions({ request: request(), userId: 'user-1' })
    const signedChallenge = options.body._signedChallenge
    const challenge = options.body.options.challenge
    consumePasskeyChallenge.mockResolvedValueOnce({
      row: { challenge: signedChallenge, expires_at: new Date(Date.now() + 60_000).toISOString() },
      error: null,
    })

    const result = await verifyPasskeyRegistration({
      request: request(),
      userId: 'user-1',
      body: {
        _signedChallenge: signedChallenge,
        credential: {
          id: webauthnCredentialId(),
          rawId: webauthnCredentialId(),
          response: {
            clientDataJSON: Buffer.from(JSON.stringify({
              type: 'webauthn.create',
              challenge,
              origin: 'https://app.example.com',
            })).toString('base64url'),
            attestationObject: attestationObject({ rpId: 'app.example.com', fmt: 'packed' }),
          },
        },
      },
    })

    expect(result).toEqual({
      body: { error: 'Unsupported attestation format' },
      status: 400,
    })
  })

  it('returns a safe server error when challenge persistence fails', async () => {
    select.mockResolvedValueOnce({
      data: [{ email: 'ada@example.com', first_name: 'Ada', last_name: 'Lovelace' }],
    })
    storePasskeyChallenge.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })

    const result = await createPasskeyRegistrationOptions({ request: request(), userId: 'user-1' })

    expect(result.status).toBe(500)
    expect(result.body).toEqual({ error: 'Failed to create passkey challenge' })
  })
})
