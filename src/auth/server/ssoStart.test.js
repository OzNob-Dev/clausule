import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSsoStart } from './ssoStart.js'

vi.mock('./ssoState.js', () => ({
  createSsoAuthState: vi.fn(),
}))

import { createSsoAuthState } from './ssoState.js'

describe('createSsoStart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_CLIENT_ID = 'google-client'
    createSsoAuthState.mockResolvedValue({ error: null })
  })

  it('builds a provider redirect url', async () => {
    await expect(createSsoStart({ requestUrl: 'http://localhost/login', provider: 'google' })).resolves.toMatchObject({ redirect: expect.stringContaining('accounts.google.com') })
  })
})
