import { describe, expect, it, beforeEach, vi } from 'vitest'
import crypto from 'node:crypto'
import { authAttemptOperationKey, passkeyAttemptOperationKey, registerOperationKey, subscribeOperationKey } from './backendOperation.js'

describe('backendOperation', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
  })

  it('builds stable operation keys', () => {
    expect(registerOperationKey({ email: 'Ada@Example.com' })).toContain('register:ada@example.com')
    expect(subscribeOperationKey({ authedId: 'user-1', email: 'Ada@Example.com' })).toContain('subscribe:user-1')
    expect(authAttemptOperationKey({ operationType: 'login_otp', email: 'Ada@Example.com', code: '123456' })).toContain('login_otp:ada@example.com:')
    expect(passkeyAttemptOperationKey({ credentialId: 'cred-1', signedChallenge: 'signed.challenge' })).toContain('login_passkey:cred-1:')
  })
})
