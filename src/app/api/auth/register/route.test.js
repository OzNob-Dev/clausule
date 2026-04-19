import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersistentSession } from '@api/_lib/session.js'
import { createUser, select, upsert } from '@api/_lib/supabase.js'
import { POST } from './route.js'

vi.mock('@api/_lib/supabase.js', () => ({
  createUser: vi.fn(),
  select: vi.fn(),
  upsert: vi.fn(),
}))

vi.mock('@api/_lib/session.js', () => ({
  createPersistentSession: vi.fn(async () => ({ accessToken: 'access-token', refreshToken: 'refresh-token' })),
  appendSessionCookies: vi.fn((response) => response),
}))

function registerRequest(body = {}) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'Ada@Example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      ...body,
    }),
  })
}

describe('register route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    upsert.mockResolvedValue({ data: [{ role: 'employee' }] })
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
  })
})
