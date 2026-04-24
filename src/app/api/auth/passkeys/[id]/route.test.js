import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { del, select } from '@api/_lib/supabase.js'
import { DELETE } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  del: vi.fn(),
  select: vi.fn(),
}))

describe('passkeys/[id] route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    del.mockResolvedValue({ data: null, error: null })
  })

  it('deletes an owned device when more than one passkey exists', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'device-1' }], error: null })
      .mockResolvedValueOnce({ data: [{ id: 'device-1' }, { id: 'device-2' }], error: null })

    const response = await DELETE(new Request('http://localhost/api/auth/passkeys/device-1', { method: 'DELETE' }), {
      params: { id: 'device-1' },
    })

    expect(response.status).toBe(204)
    expect(del).toHaveBeenCalledWith('passkeys', 'id=eq.device-1&user_id=eq.user-1')
  })

  it('rejects removing the last registered device', async () => {
    select
      .mockResolvedValueOnce({ data: [{ id: 'device-1' }], error: null })
      .mockResolvedValueOnce({ data: [{ id: 'device-1' }], error: null })

    const response = await DELETE(new Request('http://localhost/api/auth/passkeys/device-1', { method: 'DELETE' }), {
      params: { id: 'device-1' },
    })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({ error: 'Cannot remove your only registered device' })
    expect(del).not.toHaveBeenCalled()
  })
})
