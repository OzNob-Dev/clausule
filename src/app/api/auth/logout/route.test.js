import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAuthCookies, getRefreshToken } from '@api/_lib/auth.js'
import { revokeRefreshSession } from '@auth/server/refreshSession.js'
import { POST } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  getRefreshToken: vi.fn(),
  clearAuthCookies: vi.fn(() => ['clausule_at=; Max-Age=0', 'clausule_rt=; Max-Age=0', 'clausule_session=; Max-Age=0']),
}))

vi.mock('@auth/server/refreshSession.js', () => ({
  revokeRefreshSession: vi.fn(),
}))

describe('auth logout route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('revokes the refresh token when present and always clears auth cookies', async () => {
    getRefreshToken.mockReturnValue('refresh-token')
    revokeRefreshSession.mockRejectedValueOnce(new Error('db unavailable'))

    const response = await POST(new Request('http://localhost/api/auth/logout', { method: 'POST' }))

    expect(response.status).toBe(200)
    expect(revokeRefreshSession).toHaveBeenCalledWith('refresh-token')
    expect(clearAuthCookies).toHaveBeenCalled()
    expect(response.headers.get('set-cookie')).toContain('clausule_at=; Max-Age=0')
  })
})
