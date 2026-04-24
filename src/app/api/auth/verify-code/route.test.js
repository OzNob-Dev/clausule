import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { rpc, select } from '@api/_lib/supabase.js'
import { beginBackendOperation, completeBackendOperation } from '@features/auth/server/backendOperation.js'
import { POST } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
  select: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

vi.mock('@features/auth/server/backendOperation.js', () => ({
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
    completeBackendOperation.mockResolvedValue({ data: [{ status: 'completed' }], error: null })
    rpc.mockImplementation(async (fn) => {
      return { data: null, error: null }
    })
  })

  it('loads the profile case-insensitively after a valid OTP', async () => {
    rpc.mockResolvedValueOnce({ data: [{ id: 'otp-1' }], error: null })
    select.mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee', is_active: true, is_deleted: false }] })

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith('consume_email_otp_code', expect.objectContaining({
      p_email: 'ada@example.com',
      p_code: '123456',
      p_now: expect.any(String),
    }))
    expect(select).toHaveBeenCalledWith('profiles', 'email=eq.ada%40example.com&select=id%2Crole%2Cis_active%2Cis_deleted&limit=1')
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      authMethod: 'otp',
    })
  })

  it('rejects a replayed or expired OTP when the atomic consume returns no row', async () => {
    rpc.mockResolvedValueOnce({ data: [], error: null })

    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Invalid or expired code - request a new one' })
    expect(select).not.toHaveBeenCalled()
    expect(createPersistentSession).not.toHaveBeenCalled()
  })

  it('replays a completed OTP login after session creation fails once', async () => {
    select.mockResolvedValue({ data: [{ id: 'user-1', role: 'employee', is_active: true, is_deleted: false }] })
    createPersistentSession
      .mockRejectedValueOnce(new Error('session failed'))
      .mockResolvedValueOnce({ accessToken: 'access-token', refreshToken: 'refresh-token' })
    rpc.mockResolvedValueOnce({ data: [{ id: 'otp-1' }], error: null })

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
    expect(select).toHaveBeenCalledTimes(1)
  })
})
