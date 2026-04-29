import { describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const { createSsoStart } = vi.hoisted(() => ({
  createSsoStart: vi.fn(),
}))

vi.mock('@auth/server/ssoStart.js', () => ({
  createSsoStart,
}))

describe('auth sso start route', () => {
  it('returns json when the sso starter provides a body', async () => {
    createSsoStart.mockResolvedValueOnce({ status: 200, body: { url: 'https://example.com' } })

    const response = await GET(new Request('http://localhost/api/auth/sso/google'), { params: { provider: 'google' } })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ url: 'https://example.com' })
  })

  it('redirects when the sso starter returns a redirect', async () => {
    createSsoStart.mockResolvedValueOnce({ status: 302, redirect: 'https://example.com/login', stateCookie: 'sso_state=cookie; Path=/' })

    const response = await GET(new Request('http://localhost/api/auth/sso/google'), { params: { provider: 'google' } })

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://example.com/login')
    expect(response.headers.get('set-cookie')).toContain('sso_state=cookie')
  })
})
