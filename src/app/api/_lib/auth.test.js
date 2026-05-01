import crypto from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabase.js', () => ({
  select: vi.fn(),
}))

vi.mock('@auth/server/accountRepository.js', () => ({
  hasActiveSubscription: vi.fn(),
}))

import { select } from './supabase.js'
import { hasActiveSubscription } from '@auth/server/accountRepository.js'
import { accessTokenCookie, clearAuthCookies, refreshTokenCookie, requireActiveAuth, requireAuth, sessionCookie } from './auth.js'

describe('requireAuth test bypass', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('uses SameSite=Lax for auth cookies to support OAuth return navigation', () => {
    expect(accessTokenCookie('token-1')).toContain('SameSite=Lax')
    expect(refreshTokenCookie('token-2')).toContain('SameSite=Lax')
    expect(sessionCookie()).toContain('SameSite=Lax')
    expect(clearAuthCookies().every((cookie) => cookie.includes('SameSite=Lax'))).toBe(true)
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS
    delete process.env.JWT_SECRET
  })

  it('returns a fake employee session when the auth test bypass is enabled', async () => {
    process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS = 'employee'

    expect(requireAuth(new Request('http://localhost/api/auth/me'))).toEqual({
      userId: 'auth-test-employee',
      email: 'employee.test@clausule.app',
      role: 'employee',
      authMethod: 'otp',
      error: null,
    })
  })

  it('rejects an authenticated token when the profile is inactive or deleted', async () => {
    process.env.JWT_SECRET = 'test-secret'
    const exp = Math.floor(Date.now() / 1000) + 60
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      type: 'access',
      exp,
    })).toString('base64url')
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const sig = crypto.createHmac('sha256', 'test-secret').update(`${header}.${payload}`).digest('base64url')
    const token = `${header}.${payload}.${sig}`

    select.mockResolvedValueOnce({ data: [{ id: 'user-1', is_active: false, is_deleted: true }], error: null })

    await expect(requireActiveAuth(new Request('http://localhost', {
      headers: { cookie: `clausule_at=${encodeURIComponent(token)}` },
    }))).resolves.toEqual({
      userId: null,
      email: null,
      role: null,
      authMethod: null,
      error: 'User not found',
    })
  })

  it('caches the common active profile lookup briefly', async () => {
    process.env.JWT_SECRET = 'test-secret'
    const exp = Math.floor(Date.now() / 1000) + 60
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-1',
      email: 'ada@example.com',
      role: 'employee',
      type: 'access',
      exp,
    })).toString('base64url')
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const sig = crypto.createHmac('sha256', 'test-secret').update(`${header}.${payload}`).digest('base64url')
    const token = `${header}.${payload}.${sig}`
    const request = new Request('http://localhost', {
      headers: { cookie: `clausule_at=${encodeURIComponent(token)}` },
    })

    select.mockResolvedValueOnce({ data: [{ id: 'user-1', is_active: true, is_deleted: false }], error: null })

    await expect(requireActiveAuth(request)).resolves.toMatchObject({ userId: 'user-1', error: null })
    await expect(requireActiveAuth(request)).resolves.toMatchObject({ userId: 'user-1', error: null })

    expect(select).toHaveBeenCalledTimes(1)
    expect(hasActiveSubscription).not.toHaveBeenCalled()
  })

  it('expires the active profile cache after the ttl', async () => {
    vi.useFakeTimers()
    process.env.JWT_SECRET = 'test-secret'
    const exp = Math.floor(Date.now() / 1000) + 60
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-2',
      email: 'grace@example.com',
      role: 'employee',
      type: 'access',
      exp,
    })).toString('base64url')
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const sig = crypto.createHmac('sha256', 'test-secret').update(`${header}.${payload}`).digest('base64url')
    const token = `${header}.${payload}.${sig}`
    const request = new Request('http://localhost', {
      headers: { cookie: `clausule_at=${encodeURIComponent(token)}` },
    })

    select
      .mockResolvedValueOnce({ data: [{ id: 'user-2', is_active: true, is_deleted: false }], error: null })
      .mockResolvedValueOnce({ data: [{ id: 'user-2', is_active: true, is_deleted: false }], error: null })

    await expect(requireActiveAuth(request)).resolves.toMatchObject({ userId: 'user-2', error: null })
    vi.advanceTimersByTime(1001)
    await expect(requireActiveAuth(request)).resolves.toMatchObject({ userId: 'user-2', error: null })

    expect(select).toHaveBeenCalledTimes(2)
  })
})
