import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { createPersistentSession } from '@api/_lib/session.js'
import { rpc } from '@api/_lib/supabase.js'
import { createSubscription, paymentSystemConfigured } from '@features/payments/server/createSubscription.js'
import { POST } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(async () => ({ userId: null, error: 'Unauthenticated' })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

vi.mock('@features/payments/server/createSubscription.js', () => ({
  createSubscription: vi.fn(),
  paymentSystemConfigured: vi.fn(() => true),
}))

function request(body = {}) {
  return new Request('http://localhost/api/payments/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentMethodId: 'pm_1',
      email: 'Ada@Example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      ...body,
    }),
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
      user_id: 'user-9',
      session_email: 'ada@example.com',
      session_role: 'employee',
      response_body: { ok: true, subscriptionId: 'sub_1', clientSecret: 'secret_1', role: 'employee' },
    }],
    error: null,
  }
}

describe('subscribe route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: null, error: 'Unauthenticated' })
    paymentSystemConfigured.mockReturnValue(true)
    createSubscription.mockResolvedValue({
      body: { ok: true, subscriptionId: 'sub_1', clientSecret: 'secret_1', role: 'employee' },
      status: 200,
      session: { userId: 'user-9', email: 'ada@example.com', role: 'employee' },
    })
    rpc.mockImplementation(async (fn) => {
      if (fn === 'begin_backend_operation') return startedOperation()
      if (fn === 'complete_backend_operation') return completedOperation()
      return { data: null, error: null }
    })
  })

  it('returns safe route errors instead of bubbling raw exception messages', async () => {
    createSubscription.mockRejectedValueOnce(Object.assign(new Error('stripe exploded'), { status: 500 }))

    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to create subscription' })
  })

  it('replays a completed subscribe operation after session creation fails once', async () => {
    createPersistentSession
      .mockRejectedValueOnce(new Error('session failed'))
      .mockResolvedValueOnce({ accessToken: 'access-token', refreshToken: 'refresh-token' })

    const first = await POST(request())
    const firstBody = await first.json()

    rpc.mockImplementationOnce(async () => completedOperation())

    const second = await POST(request())

    expect(first.status).toBe(500)
    expect(firstBody).toEqual({ error: 'Failed to create session' })
    expect(second.status).toBe(200)
    expect(createSubscription).toHaveBeenCalledTimes(2)
  })
})
