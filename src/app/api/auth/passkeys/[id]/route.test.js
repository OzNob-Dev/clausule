import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireActiveAuth } from '@api/_lib/auth.js'
import { rpc } from '@api/_lib/supabase.js'
import { DELETE } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message = 'Unauthenticated') => Response.json({ error: message === 'Auth lookup failed' ? 'Failed to verify session' : message }, { status: message === 'Auth lookup failed' ? 500 : 401 })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

describe('passkeys/[id] route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
    rpc.mockResolvedValue({ data: [{ status: 'deleted' }], error: null })
  })

  it('deletes an owned device when more than one passkey exists', async () => {
    const response = await DELETE(new Request('http://localhost/api/auth/passkeys/device-1', { method: 'DELETE' }), {
      params: { id: 'device-1' },
    })

    expect(response.status).toBe(204)
    expect(rpc).toHaveBeenCalledWith('delete_passkey_device', {
      p_user_id: 'user-1',
      p_passkey_id: 'device-1',
    }, { expectRows: 'single' })
  })

  it('rejects removing the last registered device', async () => {
    rpc.mockResolvedValueOnce({ data: [{ status: 'last_device' }], error: null })

    const response = await DELETE(new Request('http://localhost/api/auth/passkeys/device-1', { method: 'DELETE' }), {
      params: { id: 'device-1' },
    })
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({ error: 'Cannot remove your only registered device' })
  })

  it('returns not found when the device is not owned by the user', async () => {
    rpc.mockResolvedValueOnce({ data: [{ status: 'not_found' }], error: null })

    const response = await DELETE(new Request('http://localhost/api/auth/passkeys/device-9', { method: 'DELETE' }), {
      params: { id: 'device-9' },
    })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json).toEqual({ error: 'Device not found' })
  })
})
