import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerAccount } from './registerAccount'

const { findProfileByEmail, getUserSsoProvider, beginBackendOperation, completeBackendOperation, createUser, rpc } = vi.hoisted(() => ({
  findProfileByEmail: vi.fn(),
  getUserSsoProvider: vi.fn(),
  beginBackendOperation: vi.fn(),
  completeBackendOperation: vi.fn(),
  createUser: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('@auth/server/accountRepository.js', () => ({
  findProfileByEmail,
  getUserSsoProvider,
}))

vi.mock('@auth/server/backendOperation.js', () => ({
  beginBackendOperation,
  completeBackendOperation,
  registerOperationKey: vi.fn(() => 'operation-key'),
  registerOperationType: vi.fn(() => 'register'),
}))

vi.mock('@api/_lib/supabase.js', () => ({
  createUser,
  rpc,
}))

vi.mock('@api/_lib/network.js', () => ({
  withTimeout: vi.fn(async (work) => work()),
}))

describe('registerAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BREVO_API_KEY = ''
    findProfileByEmail.mockResolvedValue({ profile: null, error: null })
    getUserSsoProvider.mockResolvedValue({ provider: null, error: null })
    beginBackendOperation.mockResolvedValue({ error: null, replay: null })
    completeBackendOperation.mockResolvedValue({ error: null })
    createUser.mockResolvedValue({ data: { id: 'user-1' }, error: null })
    rpc.mockResolvedValue({ data: [{ role: 'employee' }], error: null })
  })

  it('validates the email and first name', async () => {
    expect((await registerAccount({ email: '', firstName: 'Ada', subscription: { amountCents: 500, currency: 'AUD', interval: 'month' } })).status).toBe(400)
    expect((await registerAccount({ email: 'ada@example.com', firstName: '', subscription: { amountCents: 500, currency: 'AUD', interval: 'month' } })).status).toBe(400)
  })

  it('creates the subscription for a new account', async () => {
    const result = await registerAccount({
      email: 'Ada@Example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      subscription: { amountCents: 500, currency: 'AUD', interval: 'month' },
    })

    expect(result).toMatchObject({ status: 200, body: { ok: true, role: 'employee' } })
    expect(createUser).toHaveBeenCalledWith({ email: 'ada@example.com', user_metadata: { first_name: 'Ada', last_name: 'Lovelace' } })
  })

  it('blocks accounts that already require sso', async () => {
    findProfileByEmail.mockResolvedValueOnce({ profile: { id: 'user-2', is_deleted: false, totp_secret: '' }, error: null })
    getUserSsoProvider.mockResolvedValueOnce({ provider: 'google', error: null })

    const result = await registerAccount({
      email: 'ada@example.com',
      firstName: 'Ada',
      subscription: { amountCents: 500, currency: 'AUD', interval: 'month' },
    })

    expect(result.status).toBe(403)
    expect(result.body).toEqual({ error: 'Account requires SSO sign-in', nextStep: 'sso' })
  })
})
