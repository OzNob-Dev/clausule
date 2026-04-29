import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

function request(url: string, cookie = '') {
  return new NextRequest(url, {
    headers: cookie ? { cookie } : {},
  })
}

describe('middleware', () => {
  it('allows protected routes when an access token cookie exists', () => {
    const response = middleware(request('http://localhost/brag', 'clausule_at=token'))
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-request-x-clausule-pathname')).toBe('/brag')
  })

  it('adds the pathname header for public routes too', () => {
    const response = middleware(request('http://localhost/login'))
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-request-x-clausule-pathname')).toBe('/login')
  })
})
