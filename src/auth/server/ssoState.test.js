import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeSsoAuthState, createSsoAuthState } from './ssoState.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

import { rpc } from '@api/_lib/supabase.js'

describe('ssoState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rpc.mockResolvedValue({ data: [{ id: 'state-1' }], error: null })
  })

  it('stores and consumes sso auth states', async () => {
    await expect(createSsoAuthState({ state: 'state-1', provider: 'google', codeVerifier: 'verifier', redirectOrigin: 'http://localhost', expiresAt: new Date().toISOString() })).resolves.toEqual({ data: [{ id: 'state-1' }], error: null })
    await expect(consumeSsoAuthState({ state: 'state-1', provider: 'google' })).resolves.toMatchObject({ row: { id: 'state-1' }, error: null })
  })
})
