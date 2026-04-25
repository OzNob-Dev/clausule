import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { createUser, getAuthUser, rpc, select } from '@api/_lib/supabase.js'
import { POST } from './route.js'

const sendTransacEmail = vi.fn()

vi.mock('@api/_lib/supabase.js', () => ({
  createUser: vi.fn(),
  getAuthUser: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: vi.fn(() => ({
    transactionalEmails: { sendTransacEmail },
  })),
}))

vi.mock('@features/auth/server/signupVerification.js', () => ({
  verifySignupVerificationToken: vi.fn(() => ({ ok: true })),
}))

function registerRequest(body = {}) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'Ada@Example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      verificationToken: 'signup-token',
      subscription: { amountCents: 500, currency: 'AUD', interval: 'month' },
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
      stripe_customer_id: null,
      stripe_subscription_id: null,
    }],
    error: null,
  }
}

function completedOperation(userId = 'user-1') {
  return {
    data: [{
      status: 'completed',
      status_code: 200,
      user_id: userId,
      session_email: 'ada@example.com',
      session_role: 'employee',
      response_body: { ok: true, role: 'employee' },
      stripe_customer_id: null,
      stripe_subscription_id: null,
    }],
    error: null,
  }
}

describe('register route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BREVO_API_KEY = 'brevo-key'
    getAuthUser.mockResolvedValue({
      data: { user: { email: 'ada@example.com', app_metadata: { provider: 'email' }, identities: [{ provider: 'email' }] } },
      error: null,
    })
    rpc.mockImplementation(async (fn) => {
      if (fn === 'begin_backend_operation') return startedOperation()
      if (fn === 'finalize_individual_subscription') return { data: [{ role: 'employee' }], error: null }
      if (fn === 'complete_backend_operation') return completedOperation()
      return { data: null, error: null }
    })
  })

  it('uses an existing profile case-insensitively instead of creating a duplicate auth user', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee' }] })

    const response = await POST(registerRequest())

    expect(response.status).toBe(200)
    expect(createUser).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenCalledWith('begin_backend_operation', expect.objectContaining({
      p_operation_type: 'register',
      p_operation_key: 'register:ada@example.com:individual:aud:500:month',
      p_email: 'ada@example.com',
    }))
    expect(rpc).toHaveBeenCalledWith('finalize_individual_subscription', expect.objectContaining({
      p_user_id: 'user-1',
      p_email: 'ada@example.com',
      p_first_name: 'Ada',
      p_last_name: 'Lovelace',
      p_status: 'active',
      p_amount_cents: 500,
      p_retry_key: 'register:ada@example.com:individual:aud:500:month',
      p_activate: true,
    }))
    expect(rpc).toHaveBeenCalledWith('complete_backend_operation', expect.objectContaining({
      p_operation_type: 'register',
      p_user_id: 'user-1',
      p_session_email: 'ada@example.com',
      p_response_body: { ok: true, role: 'employee' },
    }), { expectRows: 'single' })
    expect(sendTransacEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: expect.stringContaining('Your Clausule invoice'),
      to: [{ email: 'ada@example.com' }],
      htmlContent: expect.stringContaining('$5.00'),
    }))
    expect(createPersistentSession).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
    })
  })

  it('recovers when auth user creation reports an existing OTP-created account after profile appears', async () => {
    select
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ id: 'user-2', role: 'employee' }] })
    createUser.mockResolvedValueOnce({ data: null, error: { message: 'User already registered' } })

    const response = await POST(registerRequest())

    expect(response.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith('finalize_individual_subscription', expect.objectContaining({ p_user_id: 'user-2' }))
    expect(sendTransacEmail).toHaveBeenCalled()
  })

  it('uses the Supabase admin nested user id when creating a new user', async () => {
    select.mockResolvedValueOnce({ data: [] })
    createUser.mockResolvedValueOnce({ data: { user: { id: 'user-4' } }, error: null })

    const response = await POST(registerRequest())

    expect(response.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith('finalize_individual_subscription', expect.objectContaining({ p_user_id: 'user-4' }))
    expect(sendTransacEmail).toHaveBeenCalled()
  })

  it('fails when the subscription transaction cannot be saved', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-5', role: 'employee' }] })
    rpc.mockImplementationOnce(async () => startedOperation())
      .mockImplementationOnce(async () => ({ data: null, error: { message: 'profile failed' } }))

    const response = await POST(registerRequest())
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to create subscription' })
    expect(sendTransacEmail).not.toHaveBeenCalled()
  })

  it('rejects an invalid subscription amount', async () => {
    const response = await POST(registerRequest({ subscription: { amountCents: 499, currency: 'AUD', interval: 'month' } }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid subscription plan' })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('keeps registration successful when the invoice email fails', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-3', role: 'employee' }] })
    sendTransacEmail.mockRejectedValueOnce(new Error('email failed'))

    const response = await POST(registerRequest())

    expect(response.status).toBe(200)
    expect(createPersistentSession).toHaveBeenCalled()
  })

  it('returns conflict when an active subscription already exists', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-6', role: 'employee' }] })
    rpc.mockImplementationOnce(async () => startedOperation())
      .mockImplementationOnce(async () => ({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "idx_subscriptions_user_id_unique"' },
      }))

    const response = await POST(registerRequest())
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data).toEqual({ error: 'Active subscription already exists' })
    expect(createPersistentSession).not.toHaveBeenCalled()
  })

  it('re-checks auth policy if a duplicate-user race reveals an existing SSO account', async () => {
    select
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ id: 'user-sso', totp_secret: null }] })
    createUser.mockResolvedValueOnce({ data: null, error: { message: 'User already registered' } })
    getAuthUser.mockResolvedValueOnce({
      data: { user: { email: 'ada@example.com', app_metadata: { provider: 'google' }, identities: [{ provider: 'google' }] } },
      error: null,
    })

    const response = await POST(registerRequest())
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Account requires SSO sign-in', nextStep: 'sso' })
    expect(createPersistentSession).not.toHaveBeenCalled()
  })

  it('replays a completed registration after session creation fails once', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-8', role: 'employee' }] })
    createPersistentSession
      .mockRejectedValueOnce(new Error('session failed'))
      .mockResolvedValueOnce({ accessToken: 'access-token', refreshToken: 'refresh-token' })
    rpc
      .mockImplementationOnce(async () => startedOperation())
      .mockImplementationOnce(async () => ({ data: [{ role: 'employee' }], error: null }))
      .mockImplementationOnce(async () => completedOperation('user-8'))
      .mockImplementationOnce(async () => completedOperation('user-8'))

    const first = await POST(registerRequest())
    const firstBody = await first.json()

    rpc.mockImplementation(async (fn) => {
      if (fn === 'begin_backend_operation') return completedOperation('user-8')
      if (fn === 'complete_backend_operation') return completedOperation('user-8')
      if (fn === 'finalize_individual_subscription') return { data: [{ role: 'employee' }], error: null }
      return { data: null, error: null }
    })

    const second = await POST(registerRequest())

    expect(first.status).toBe(500)
    expect(firstBody).toEqual({ error: 'Failed to create session' })
    expect(second.status).toBe(200)
    expect(createPersistentSession).toHaveBeenNthCalledWith(2, {
      userId: 'user-8',
      email: 'ada@example.com',
      role: 'employee',
    })
    expect(select).toHaveBeenCalledTimes(1)
  })
})
