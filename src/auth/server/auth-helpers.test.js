import { beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'node:crypto'
import {
  authAttemptOperationKey,
  beginBackendOperation,
  completeBackendOperation,
  passkeyAttemptOperationKey,
  registerOperationKey,
  subscribeOperationKey,
} from './backendOperation.js'
import {
  consumePasskeyAuthChallenge,
  consumePasskeyChallenge,
  storePasskeyAuthChallenge,
  storePasskeyChallenge,
} from './passkeyChallenge.js'
import {
  getChallengeTtlMs,
  getExpectedOrigin,
  getRpId,
  getRpName,
  jsonError,
  signChallenge,
  verifySignedChallenge,
} from './passkeyShared.js'
import {
  consumeDistributedRateLimit,
} from './distributedRateLimit.js'
import {
  verifyEmailOtpCode,
} from './emailOtpVerification.js'
import {
  reconcileProfileEmail,
} from './reconcileProfileEmail.js'
import {
  createSsoAuthState,
  consumeSsoAuthState,
} from './ssoState.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
  update: vi.fn(),
}))

import { rpc, update } from '@api/_lib/supabase.js'

describe('auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.WEBAUTHN_CHALLENGE_SECRET = 'test-secret'
    process.env.NODE_ENV = 'development'
  })

  it('verifies and consumes distributed limits and otp codes', async () => {
    rpc.mockResolvedValueOnce({ data: [{ allowed: true, retry_after_ms: 0 }], error: null })
    await expect(consumeDistributedRateLimit({ scope: 'x', identifier: 'u', limit: 1, windowMs: 1 })).resolves.toEqual({ allowed: true, retryAfterMs: 0, error: null })

    rpc.mockResolvedValueOnce({ data: [{ id: 'ok' }], error: null })
    await expect(verifyEmailOtpCode('a@example.com', '123456')).resolves.toEqual({ ok: true })
  })

  it('signs and verifies challenges and resolves local origins', () => {
    const challenge = Buffer.from('hello')
    const signed = signChallenge(challenge)

    expect(verifySignedChallenge(signed)).toBe('aGVsbG8')
    expect(getRpName()).toBe('Clausule')
    expect(getChallengeTtlMs()).toBe(300000)
    expect(getRpId(new Request('http://localhost', { headers: { host: 'localhost:3000' } }))).toBe('localhost')
    expect(getExpectedOrigin(new Request('http://localhost', { headers: { host: 'localhost:3000' } }))).toBe('http://localhost:3000')
    expect(jsonError('bad', 400)).toEqual({ body: { error: 'bad' }, status: 400 })
  })

  it('reconciles profile email and consumes sso state', async () => {
    update.mockResolvedValueOnce({ error: null })
    await expect(reconcileProfileEmail({ userId: 'user-1', profileEmail: 'old@example.com', authEmail: 'New@Example.com' })).resolves.toEqual({ email: 'new@example.com', repaired: true })

    rpc.mockResolvedValueOnce({ data: [{ id: 'state-1' }], error: null })
    await expect(createSsoAuthState({ state: 'state-1', provider: 'google', codeVerifier: 'verifier', redirectOrigin: 'http://localhost', expiresAt: new Date().toISOString() })).resolves.toEqual({ data: [{ id: 'state-1' }], error: null })

    rpc.mockResolvedValueOnce({ data: [{ state: 'state-1' }], error: null })
    await expect(consumeSsoAuthState({ state: 'state-1', provider: 'google' })).resolves.toMatchObject({ row: { state: 'state-1' }, error: null })
  })

  it('builds backend operation keys and consumes passkey challenges', async () => {
    process.env.JWT_SECRET = 'secret'
    expect(registerOperationKey({ email: 'Ada@Example.com' })).toContain('register:ada@example.com')
    expect(subscribeOperationKey({ authedId: 'user-1', email: 'Ada@Example.com' })).toContain('subscribe:user-1')
    expect(authAttemptOperationKey({ operationType: 'login_otp', email: 'Ada@Example.com', code: '123456' })).toContain('login_otp:ada@example.com:')
    expect(passkeyAttemptOperationKey({ credentialId: 'cred-1', signedChallenge: 'signed.challenge' })).toContain('login_passkey:cred-1:')

    rpc.mockResolvedValueOnce({ data: [{ status: 'started' }], error: null })
    await expect(beginBackendOperation({ operationKey: 'k', operationType: 'register', email: 'Ada@Example.com', userId: 'user-1' })).resolves.toMatchObject({ row: { status: 'started' }, replay: null })

    rpc.mockResolvedValueOnce({ data: [{ id: 'completed' }], error: null })
    await expect(completeBackendOperation({ operationKey: 'k', operationType: 'register', statusCode: 200, session: { userId: 'user-1', email: 'ada@example.com', role: 'employee' }, body: { ok: true } })).resolves.toEqual({ data: [{ id: 'completed' }], error: null })

    rpc.mockResolvedValueOnce({ data: [{ id: 'challenge-1' }], error: null })
    await expect(storePasskeyChallenge({ userId: 'user-1', challenge: 'abc', expiresAt: new Date().toISOString() })).resolves.toEqual({ data: [{ id: 'challenge-1' }], error: null })

    rpc.mockResolvedValueOnce({ data: [{ id: 'challenge-1' }], error: null })
    await expect(storePasskeyAuthChallenge({ challenge: 'abc', expiresAt: new Date().toISOString() })).resolves.toEqual({ data: [{ id: 'challenge-1' }], error: null })

    rpc.mockResolvedValueOnce({ data: [{ id: 'challenge-1' }], error: null })
    await expect(consumePasskeyChallenge({ userId: 'user-1', challenge: 'abc' })).resolves.toMatchObject({ row: { id: 'challenge-1' }, error: null })

    rpc.mockResolvedValueOnce({ data: [{ id: 'challenge-1' }], error: null })
    await expect(consumePasskeyAuthChallenge({ challenge: 'abc' })).resolves.toMatchObject({ row: { id: 'challenge-1' }, error: null })
  })
})
