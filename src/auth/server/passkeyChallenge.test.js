import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consumePasskeyAuthChallenge, consumePasskeyChallenge, storePasskeyAuthChallenge, storePasskeyChallenge } from './passkeyChallenge.js'

vi.mock('@api/_lib/supabase.js', () => ({
  rpc: vi.fn(),
}))

import { rpc } from '@api/_lib/supabase.js'

describe('passkeyChallenge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    rpc.mockResolvedValue({ data: [{ id: 'challenge-1' }], error: null })
  })

  it('stores and consumes passkey challenges', async () => {
    await expect(storePasskeyChallenge({ userId: 'user-1', challenge: 'abc', expiresAt: new Date().toISOString() })).resolves.toEqual({ data: [{ id: 'challenge-1' }], error: null })
    await expect(storePasskeyAuthChallenge({ challenge: 'abc', expiresAt: new Date().toISOString() })).resolves.toEqual({ data: [{ id: 'challenge-1' }], error: null })
    await expect(consumePasskeyChallenge({ userId: 'user-1', challenge: 'abc' })).resolves.toMatchObject({ row: { id: 'challenge-1' }, error: null })
    await expect(consumePasskeyAuthChallenge({ challenge: 'abc' })).resolves.toMatchObject({ row: { id: 'challenge-1' }, error: null })
  })
})
