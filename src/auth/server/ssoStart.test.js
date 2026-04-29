import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSsoStart } from './ssoStart.js'

vi.mock('./ssoState.js', () => ({
  createSsoAuthState: vi.fn(),
  createSsoStateCookie: vi.fn(() => 'sso_state=cookie; Path=/'),
}))

import { createSsoAuthState, createSsoStateCookie } from './ssoState.js'

describe('createSsoStart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_CLIENT_ID = 'google-client'
    createSsoAuthState.mockResolvedValue({ error: null })
  })

  it('builds a provider redirect url', async () => {
    await expect(createSsoStart({ requestUrl: 'http://localhost/login', provider: 'google' })).resolves.toMatchObject({
      redirect: expect.stringContaining('accounts.google.com'),
      stateCookie: 'sso_state=cookie; Path=/',
    })
    expect(createSsoStateCookie).toHaveBeenCalled()
  })

  it('falls back to the signed cookie when state persistence fails', async () => {
    createSsoAuthState.mockResolvedValueOnce({ error: { message: 'rpc missing' } })

    await expect(createSsoStart({ requestUrl: 'http://localhost/login', provider: 'google' })).resolves.toMatchObject({
      redirect: expect.stringContaining('accounts.google.com'),
      stateCookie: 'sso_state=cookie; Path=/',
      warning: { message: 'rpc missing' },
    })
  })
})
