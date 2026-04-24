import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { createUser, rpc, select } from '@api/_lib/supabase.js'
import { POST } from './route.js'

const sendTransacEmail = vi.fn()

vi.mock('@api/_lib/supabase.js', () => ({
  createUser: vi.fn(),
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

function registerRequest(body = {}) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'Ada@Example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      subscription: { amountCents: 500, currency: 'AUD', interval: 'month' },
      ...body,
    }),
  })
}

describe('register route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BREVO_API_KEY = 'brevo-key'
    rpc.mockResolvedValue({ data: [{ role: 'employee' }], error: null })
  })

  it('uses an existing profile case-insensitively instead of creating a duplicate auth user', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee' }] })

    const response = await POST(registerRequest())

    expect(response.status).toBe(200)
    expect(createUser).not.toHaveBeenCalled()
    expect(rpc).toHaveBeenCalledWith('finalize_individual_subscription', expect.objectContaining({
      p_user_id: 'user-1',
      p_email: 'ada@example.com',
      p_first_name: 'Ada',
      p_last_name: 'Lovelace',
      p_status: 'active',
      p_amount_cents: 500,
      p_activate: true,
    }))
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
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'profile failed' } })

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
    rpc.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint "idx_subscriptions_active_user_unique"' },
    })

    const response = await POST(registerRequest())
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data).toEqual({ error: 'Active subscription already exists' })
    expect(createPersistentSession).not.toHaveBeenCalled()
  })
})
