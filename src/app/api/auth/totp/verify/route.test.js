import { beforeEach, describe, expect, it, vi } from 'vitest'
import { totpCode } from '@api/_lib/totp.js'
import { createPersistentSession } from '@api/_lib/session.js'
import { rpc, select } from '@api/_lib/supabase.js'
import { authAttemptOperationKey } from '@features/auth/server/backendOperation.js'
import { POST } from './route.js'

vi.mock('@features/auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit: vi.fn(async () => ({ allowed: true, retryAfterMs: 0, error: null })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
  select: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

vi.mock('@features/auth/server/backendOperation.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    authAttemptOperationKey: vi.fn(),
  }
})

const SECRET = 'JBSWY3DPEHPK3PXP'

function request(email = 'Ada@Example.com', code = totpCode(SECRET, Math.floor(Date.now() / 1000 / 30))) {
  return new Request('http://localhost/api/auth/totp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
}

describe('totp verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T10:00:00Z'))
    authAttemptOperationKey.mockImplementation(({ operationType, email }) => `${operationType}:${email}:hashed`)
    rpc.mockImplementation(async (fn) => {
      if (fn === 'begin_backend_operation') {
        return {
          data: [{
            status: 'started',
            status_code: 200,
            user_id: null,
            session_email: null,
            session_role: null,
            response_body: null,
          }],
          error: null,
        }
      }
      if (fn === 'complete_backend_operation') {
        return {
          data: [{
            status: 'completed',
            status_code: 200,
            user_id: 'user-1',
            session_email: 'ada@example.com',
            session_role: 'employee',
            response_body: { ok: true, role: 'employee' },
          }],
          error: null,
        }
      }
      return { data: null, error: null }
    })
  })

  it('loads the profile case-insensitively and accepts a valid TOTP', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', totp_secret: SECRET, is_active: true, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [] })

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(authAttemptOperationKey).toHaveBeenCalledWith({
      operationType: 'login_totp',
      email: 'ada@example.com',
      code: expect.any(String),
    })
    expect(rpc).toHaveBeenCalledWith('begin_backend_operation', expect.objectContaining({
      p_operation_key: 'login_totp:ada@example.com:hashed',
    }))
    expect(select).toHaveBeenNthCalledWith(1, 'profiles', 'email=eq.ada%40example.com&select=id%2Crole%2Ctotp_secret%2Cis_active%2Cis_deleted&limit=1')
    expect(select).toHaveBeenNthCalledWith(2, 'subscriptions', 'user_id=eq.user-1&status=in.%28active%2Ctrialing%29&select=id&limit=1')
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'totp',
    })
  })

  it('replays a completed TOTP login after session creation fails once', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', totp_secret: SECRET, is_active: true, is_deleted: false }] })
      .mockResolvedValueOnce({ data: [] })
    createPersistentSession
      .mockRejectedValueOnce(new Error('session failed'))
      .mockResolvedValueOnce({ accessToken: 'access-token', refreshToken: 'refresh-token' })

    const first = await POST(request())
    const firstBody = await first.json()

    rpc.mockImplementationOnce(async () => ({
      data: [{
        status: 'completed',
        status_code: 200,
        user_id: 'user-1',
        session_email: 'ada@example.com',
        session_role: 'employee',
        response_body: { ok: true, role: 'employee' },
      }],
      error: null,
    }))

    const second = await POST(request())

    expect(first.status).toBe(500)
    expect(firstBody).toEqual({ error: 'Failed to create session' })
    expect(second.status).toBe(200)
    expect(select).toHaveBeenCalledTimes(2)
  })
})
