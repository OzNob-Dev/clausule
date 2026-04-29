import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSignupUser } from './createSignupUser.js'

vi.mock('@api/_lib/supabase.js', () => ({
  createUser: vi.fn(),
}))

vi.mock('./signupVerification.js', () => ({
  verifySignupVerificationToken: vi.fn(),
}))

import { createUser } from '@api/_lib/supabase.js'
import { verifySignupVerificationToken } from './signupVerification.js'

describe('createSignupUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifySignupVerificationToken.mockReturnValue({ ok: true })
    createUser.mockResolvedValue({ data: { id: 'user-2' }, error: null })
  })

  it('creates an account when the token is valid', async () => {
    await expect(createSignupUser({ firstName: 'Ada', lastName: 'Lovelace', email: 'Ada@Example.com', verificationToken: 'token' })).resolves.toEqual({ body: { ok: true, userId: 'user-2' }, status: 201 })
  })
})
