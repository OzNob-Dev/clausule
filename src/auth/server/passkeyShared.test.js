import { describe, expect, it } from 'vitest'
import { getChallengeTtlMs, getExpectedOrigin, getRpId, getRpName, jsonError, signChallenge, verifySignedChallenge } from './passkeyShared.js'

describe('passkeyShared', () => {
  it('signs and validates passkey challenges', () => {
    process.env.WEBAUTHN_CHALLENGE_SECRET = 'test-secret'
    expect(getRpName()).toBe('Clausule')
    expect(getChallengeTtlMs()).toBe(300000)
    expect(verifySignedChallenge(signChallenge(Buffer.from('hello')))).toBe('aGVsbG8')
    expect(getRpId(new Request('http://localhost', { headers: { host: 'localhost:3000' } }))).toBe('localhost')
    expect(getExpectedOrigin(new Request('http://localhost', { headers: { host: 'localhost:3000' } }))).toBe('http://localhost:3000')
    expect(jsonError('bad', 400)).toEqual({ body: { error: 'bad' }, status: 400 })
  })
})
