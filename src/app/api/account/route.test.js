import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuth, clearAuthCookies } from '@api/_lib/auth.js'
import { del, update } from '@api/_lib/supabase.js'
import { DELETE } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireAuth: vi.fn(),
  unauthorized: vi.fn((message = 'Unauthenticated') => Response.json({ error: message }, { status: 401 })),
  clearAuthCookies: vi.fn(() => ['clausule_at=; Max-Age=0', 'clausule_rt=; Max-Age=0']),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  del: vi.fn(),
  update: vi.fn(),
}))

describe('account route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuth.mockReturnValue({ userId: 'user-1', error: null })
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
    })
    expect(del).toHaveBeenCalledWith('refresh_tokens', 'user_id=eq.user-1')
    expect(clearAuthCookies).toHaveBeenCalled()
    expect(response.headers.get('set-cookie')).toContain('clausule_at=; Max-Age=0')
  })
})
