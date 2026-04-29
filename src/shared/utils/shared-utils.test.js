import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cn } from './cn'
import { isAuthTestBypassEnabled } from './authTestBypass'
import { profileDisplayName, profileInitials } from './profile'
import { relativeTime } from './relativeTime'
import { homePathForRole, MANAGER_ROUTES, ROUTES } from './routes'
import { getActiveSsoProviders, ssoAuthPath, ssoConfigFromEnv, SSO_PROVIDERS } from './sso'

describe('shared utilities', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
    delete process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS
    delete process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED
    delete process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED
    delete process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  it('formats profile names and initials', () => {
    expect(profileDisplayName({ firstName: 'Ada', lastName: 'Lovelace' })).toBe('Ada Lovelace')
    expect(profileDisplayName({})).toBe('Your profile')
    expect(profileInitials({ firstName: 'Ada', lastName: 'Lovelace' })).toBe('AL')
    expect(profileInitials({ email: 'ada@example.com' })).toBe('A')
    expect(profileInitials({})).toBe('?')
  })

  it('merges class names', () => {
    expect(cn('a', false, 'b', 'px-2', 'px-4')).toBe('a b px-4')
  })

  it('maps home routes and manager routes', () => {
    expect(homePathForRole('employee')).toBe(ROUTES.brag)
    expect(homePathForRole('manager')).toBe(ROUTES.dashboard)
    expect(MANAGER_ROUTES).toEqual([ROUTES.dashboard, ROUTES.entries])
  })

  it('builds SSO providers from env and paths', () => {
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'true'
    process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED = 'true'

    expect(ssoConfigFromEnv.google).toBe(true)
    expect(ssoConfigFromEnv.microsoft).toBe(false)
    expect(getActiveSsoProviders().map((provider) => provider.id)).toEqual(['google', 'apple'])
    expect(ssoAuthPath('google')).toBe('/api/auth/sso/google')
    expect(SSO_PROVIDERS).toHaveLength(3)
  })

  it('detects the auth test bypass only in safe environments', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('NEXT_PUBLIC_AUTH_TEST_BYPASS', 'employee')
    expect(isAuthTestBypassEnabled()).toBe(true)

    vi.stubEnv('NODE_ENV', 'production')
    expect(isAuthTestBypassEnabled()).toBe(false)
  })

  it('formats relative time buckets', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-29T12:00:00Z'))

    expect(relativeTime('2026-04-29T11:59:40Z')).toBe('just now')
    expect(relativeTime('2026-04-29T11:58:00Z')).toBe('2m ago')
    expect(relativeTime('2026-04-28T12:00:00Z')).toBe('yesterday')
    expect(relativeTime('2025-04-29T12:00:00Z')).toBe('1yr ago')
  })
})
