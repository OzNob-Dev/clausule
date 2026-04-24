import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { select } from '@api/_lib/supabase.js'
import { GET } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  select: vi.fn(),
}))

describe('passkeys route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('lists only the authenticated user devices', async () => {
    select.mockResolvedValueOnce({
      data: [{ id: 'device-1', name: 'MacBook', type: 'laptop', method: 'Passkey', added_at: '2026-04-25', is_current: false }],
      error: null,
    })

    const response = await GET(new Request('http://localhost/api/auth/passkeys'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual([{
      id: 'device-1',
      name: 'MacBook',
      type: 'laptop',
      method: 'Passkey',
      addedAt: '2026-04-25',
      isCurrent: false,
    }])
    expect(select).toHaveBeenCalledWith('passkeys', 'user_id=eq.user-1&select=id,name,type,method,added_at,is_current&order=added_at.asc')
  })
})
