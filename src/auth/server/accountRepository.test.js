import { beforeEach, describe, expect, it, vi } from 'vitest'
import { accountActive, activeSubscriptionQuery, findProfileByEmail, findProfileById, getAuthUserDetails, getUserSsoProvider, hasActiveSubscription, profileByEmailQuery, profileByIdQuery, ssoProviderForAuthUser } from './accountRepository.js'

vi.mock('@api/_lib/supabase.js', () => ({
  select: vi.fn(),
  getAuthUser: vi.fn(),
}))

import { select, getAuthUser } from '@api/_lib/supabase.js'

describe('accountRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds canonical profile and subscription queries', () => {
    expect(profileByEmailQuery('Ada@Example.com', 'id')).toBe('email=eq.ada%40example.com&select=id&limit=1')
    expect(profileByIdQuery('user-1')).toBe('id=eq.user-1&select=id%2Cemail%2Crole&limit=1')
    expect(activeSubscriptionQuery('user-1')).toContain('status=in.%28active%2Ctrialing%29')
  })

  it('derives auth providers and subscription status', async () => {
    expect(ssoProviderForAuthUser({ app_metadata: { provider: 'google' } })).toBe('google')
    expect(ssoProviderForAuthUser({ app_metadata: { provider: 'email' }, identities: [{ provider: 'google' }] })).toBe('google')
    expect(ssoProviderForAuthUser({ app_metadata: { provider: 'google' }, identities: [{ provider: 'microsoft' }] })).toBe('google')
    expect(accountActive({ is_active: false }, true)).toBe(true)

    select.mockResolvedValueOnce({ data: [{ id: 'user-1' }], error: null })
    await expect(findProfileByEmail('Ada@Example.com')).resolves.toEqual({ profile: { id: 'user-1' }, error: null })

    select.mockResolvedValueOnce({ data: [{ id: 'user-1' }], error: null })
    await expect(findProfileById('user-1')).resolves.toEqual({ profile: { id: 'user-1' }, error: null })

    select.mockResolvedValueOnce({ data: [{ id: 'sub-1' }], error: null })
    await expect(hasActiveSubscription('user-1')).resolves.toEqual({ hasPaid: true, error: null })

    getAuthUser.mockResolvedValue({ data: { user: { app_metadata: { provider: 'microsoft' } } }, error: null })
    await expect(getAuthUserDetails('user-1')).resolves.toEqual({ user: { app_metadata: { provider: 'microsoft' } }, provider: 'microsoft', error: null })
    await expect(getUserSsoProvider('user-1')).resolves.toEqual({ provider: 'microsoft', error: null })
  })
})
