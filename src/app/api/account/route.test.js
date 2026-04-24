import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAuthCookies, requireActiveAuth } from '@api/_lib/auth.js'
import { del, update } from '@api/_lib/supabase.js'
import { DELETE } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
  clearAuthCookies: vi.fn(() => ['clausule_at=; Max-Age=0', 'clausule_rt=; Max-Age=0']),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  del: vi.fn(),
  update: vi.fn(),
}))

describe('account route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    update.mockResolvedValue({ data: [{ id: 'user-1' }], error: null })
    del.mockResolvedValue({ data: null, error: null })
  })

  it('soft deletes the profile, revokes refresh tokens, and clears cookies', async () => {
    const response = await DELETE(new Request('http://localhost/api/account', { method: 'DELETE' }))

    expect(response.status).toBe(204)
    expect(update).toHaveBeenCalledWith('profiles', 'id=eq.user-1', {
      is_active: false,
      is_deleted: true,
      deleted_at: expect.any(String),
    }, { expectRows: 'single' })
    expect(del).toHaveBeenCalledWith('refresh_tokens', 'user_id=eq.user-1')
    expect(clearAuthCookies).toHaveBeenCalled()
    expect(response.headers.get('set-cookie')).toContain('clausule_at=; Max-Age=0')
  })
})
