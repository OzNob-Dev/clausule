import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { createUser, insert, select, upsert } from '@api/_lib/supabase.js'
import { POST } from './route.js'

const sendTransacEmail = vi.fn()

vi.mock('@api/_lib/supabase.js', () => ({
  createUser: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  upsert: vi.fn(),
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
    upsert.mockResolvedValue({ data: [{ role: 'employee' }] })
    insert.mockResolvedValue({ data: [{ id: 'sub-1' }] })
  })

  it('uses an existing profile case-insensitively instead of creating a duplicate auth user', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-1', role: 'employee' }] })

    const response = await POST(registerRequest())

    expect(response.status).toBe(200)
    expect(createUser).not.toHaveBeenCalled()
    expect(upsert).toHaveBeenCalledWith('profiles', {
      id: 'user-1',
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
    })
    expect(insert).toHaveBeenCalledWith('subscriptions', expect.objectContaining({
      user_id: 'user-1',
      status: 'active',
      plan: 'individual',
      amount_cents: 500,
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
    expect(upsert).toHaveBeenCalledWith('profiles', {
      id: 'user-2',
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
    })
    expect(sendTransacEmail).toHaveBeenCalled()
  })

  it('rejects an invalid subscription amount', async () => {
    const response = await POST(registerRequest({ subscription: { amountCents: 499, currency: 'AUD', interval: 'month' } }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid subscription plan' })
    expect(insert).not.toHaveBeenCalled()
  })

  it('returns an error when the invoice email fails', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'user-3', role: 'employee' }] })
    sendTransacEmail.mockRejectedValueOnce(new Error('email failed'))

    const response = await POST(registerRequest())
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data).toEqual({ error: 'Failed to send invoice' })
    expect(createPersistentSession).not.toHaveBeenCalled()
  })
})
