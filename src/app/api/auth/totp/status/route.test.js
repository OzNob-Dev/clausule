import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAuth } from '@api/_lib/auth.js'
import { select } from '@api/_lib/supabase.js'
import { GET } from './route.js'

vi.mock('@api/_lib/auth.js', () => ({
  requireAuth: vi.fn(),
  unauthorized: vi.fn((message = 'Unauthenticated') => Response.json({ error: message }, { status: 401 })),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  select: vi.fn(),
}))

describe('totp status route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuth.mockReturnValue({ userId: 'user-1', error: null })
  })

  it('reports configured when the explicit profile flag is set', async () => {
    select.mockResolvedValue({ data: [{ totp_secret: null, authenticator_app_configured: true }] })

    const response = await GET(new Request('http://localhost/api/auth/totp/status'))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ configured: true })
  })
})
