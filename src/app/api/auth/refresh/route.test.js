import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { rpc } from '@api/_lib/supabase.js'
import { rotateRefreshSession } from '@features/auth/server/refreshSession.js'
import { POST } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

vi.mock('@features/auth/server/refreshSession.js', () => ({
  rotateRefreshSession: vi.fn(),
}))

function request(token = 'refresh-token') {
  return new Request('http://localhost/api/auth/refresh', {
    method: 'POST',
    headers: { cookie: `clausule_rt=${token}` },
  })
}

function startedOperation() {
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

function completedOperation() {
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

describe('refresh route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rpc.mockImplementation(async (fn) => {
      if (fn === 'begin_backend_operation') return startedOperation()
      if (fn === 'complete_backend_operation') return completedOperation()
      return { data: null, error: null }
    })
    rotateRefreshSession.mockResolvedValue({
      body: { ok: true, role: 'employee' },
      status: 200,
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee' },
    })
  })

  it('replays a completed refresh after session creation fails once', async () => {
    createPersistentSession
      .mockRejectedValueOnce(new Error('session failed'))
      .mockResolvedValueOnce({ accessToken: 'access-token', refreshToken: 'refresh-token' })

    const first = await POST(request())
    const firstBody = await first.json()

    rpc.mockImplementationOnce(async () => completedOperation())

    const second = await POST(request())

    expect(first.status).toBe(500)
    expect(firstBody).toEqual({ error: 'Failed to rotate session' })
    expect(second.status).toBe(200)
    expect(rotateRefreshSession).toHaveBeenCalledTimes(1)
  })
})
