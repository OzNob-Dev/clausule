import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeSsoAuthState, consumeSsoStateCookie, createSsoAuthState, createSsoStateCookie } from './ssoState.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

import { rpc } from '@api/_lib/supabase.js'

describe('ssoState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = '12345678901234567890123456789012'
    rpc.mockResolvedValue({ data: [{ id: 'state-1' }], error: null })
  })

  it('stores and consumes sso auth states', async () => {
    await expect(createSsoAuthState({ state: 'state-1', provider: 'google', codeVerifier: 'verifier', redirectOrigin: 'http://localhost', expiresAt: new Date().toISOString() })).resolves.toEqual({ data: [{ id: 'state-1' }], error: null })
    await expect(consumeSsoAuthState({ state: 'state-1', provider: 'google' })).resolves.toMatchObject({ row: { id: 'state-1' }, error: null })
  })

  it('signs and reads a fallback sso state cookie', () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString()
    const cookie = createSsoStateCookie({
      state: 'state-1',
      provider: 'google',
      codeVerifier: 'verifier',
      redirectOrigin: 'http://localhost',
      expiresAt,
    })

    expect(consumeSsoStateCookie({ cookieHeader: cookie, state: 'state-1', provider: 'google' })).toEqual({
      row: { code_verifier: 'verifier', redirect_origin: 'http://localhost' },
      error: null,
    })
  })
})
