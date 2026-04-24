import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { authAttemptOperationKey, beginBackendOperation, completeBackendOperation } from '@features/auth/server/backendOperation.js'
import { verifyEmailOtpLogin } from '@features/auth/server/loginVerification.js'
import { POST } from './route.js'

vi.mock('@features/auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(async () => ({ allowed: true, retryAfterMs: 0, error: null })),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

vi.mock('@features/auth/server/loginVerification.js', () => ({
  verifyEmailOtpLogin: vi.fn(),
}))

vi.mock('@features/auth/server/backendOperation.js', () => ({
  authAttemptOperationKey: vi.fn(),
  beginBackendOperation: vi.fn(),
  completeBackendOperation: vi.fn(),
}))

function request(email = 'Ada@Example.com', code = '123456') {
  return new Request('http://localhost/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
}

describe('verify-code route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    beginBackendOperation.mockResolvedValue({
      row: {
        status: 'started',
        status_code: 200,
        user_id: null,
        session_email: null,
        session_role: null,
        response_body: null,
      },
      replay: null,
    })
    authAttemptOperationKey.mockImplementation(({ operationType, email }) => `${operationType}:${email}:hashed`)
    completeBackendOperation.mockResolvedValue({ data: [{ status: 'completed' }], error: null })
    verifyEmailOtpLogin.mockResolvedValue({
      body: { ok: true, role: 'employee' },
      status: 200,
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'otp' },
    })
  })

  it('creates a session for an active email-login account after a valid OTP', async () => {
    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(verifyEmailOtpLogin).toHaveBeenCalledWith({ email: 'ada@example.com', code: '123456' })
    expect(authAttemptOperationKey).toHaveBeenCalledWith({
      operationType: 'login_otp',
      email: 'ada@example.com',
      code: '123456',
    })
    expect(beginBackendOperation).toHaveBeenCalledWith(expect.objectContaining({
      operationKey: 'login_otp:ada@example.com:hashed',
    }))
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'otp',
    })
  })

  it('rejects a replayed or expired OTP when the atomic consume returns no row', async () => {
    verifyEmailOtpLogin.mockResolvedValueOnce({ body: { error: 'Invalid or expired code - request a new one' }, status: 401 })

    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Invalid or expired code - request a new one' })
    expect(createPersistentSession).not.toHaveBeenCalled()
  })

  it('returns a signup step plus verification token after proof of email possession for a new account', async () => {
    verifyEmailOtpLogin.mockResolvedValueOnce({
      body: { ok: true, nextStep: 'signup', verificationToken: 'signup-token' },
      status: 200,
    })

    const response = await POST(request('new@example.com'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(expect.objectContaining({
      ok: true,
      nextStep: 'signup',
      verificationToken: 'signup-token',
    }))
    expect(createPersistentSession).not.toHaveBeenCalled()
  })

  it('replays a completed OTP login after session creation fails once', async () => {
    createPersistentSession
      .mockRejectedValueOnce(new Error('session failed'))
      .mockResolvedValueOnce({ accessToken: 'access-token', refreshToken: 'refresh-token' })

    const first = await POST(request())
    const firstBody = await first.json()

    beginBackendOperation.mockImplementation(async () => ({
      row: {
        status: 'completed',
        status_code: 200,
        user_id: 'user-1',
        session_email: 'ada@example.com',
        session_role: 'employee',
        response_body: { ok: true, role: 'employee' },
      },
      replay: {
        body: { ok: true, role: 'employee' },
        status: 200,
        session: { userId: 'user-1', email: 'ada@example.com', role: 'employee' },
      },
    }))

    const second = await POST(request())

    expect(first.status).toBe(500)
    expect(firstBody).toEqual({ error: 'Failed to create session' })
    expect(second.status).toBe(200)
    expect(verifyEmailOtpLogin).toHaveBeenCalledTimes(1)
  })
})
