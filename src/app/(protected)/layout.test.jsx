import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProtectedLayout from './layout'
import { useProfileStore } from '@/stores/useProfileStore'

const replace = vi.fn()
let pathname = '/brag'
let auth = { user: { id: 'user-1', email: 'ada@example.com', role: 'employee' }, loading: false }

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => auth,
}))

describe('ProtectedLayout MFA lock', () => {
  beforeEach(() => {
    pathname = '/brag'
    auth = { user: { id: 'user-1', email: 'ada@example.com', role: 'employee' }, loading: false }
    replace.mockClear()
    localStorage.clear()
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED = 'false'
    useProfileStore.getState().clearProfile()
  })

  it('redirects protected routes to brag settings until MFA is configured', async () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false })

    render(<ProtectedLayout><div>Blocked app</div></ProtectedLayout>)

    expect(screen.queryByText('Blocked app')).not.toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/brag/settings'))
  })

  it('allows brag settings while MFA setup is incomplete', () => {
    pathname = '/brag/settings'
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false })

    render(<ProtectedLayout><div>Security settings</div></ProtectedLayout>)

    expect(screen.getByText('Security settings')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('allows app access after MFA is configured', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true })

    render(<ProtectedLayout><div>Unlocked app</div></ProtectedLayout>)

    expect(screen.getByText('Unlocked app')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('redirects even when the session did not use OTP', async () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: false })

    render(<ProtectedLayout><div>SSO app</div></ProtectedLayout>)

    expect(screen.queryByText('SSO app')).not.toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/brag/settings'))
  })

  it('redirects even when SSO is configured', async () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true })

    render(<ProtectedLayout><div>SSO enabled app</div></ProtectedLayout>)

    expect(screen.queryByText('SSO enabled app')).not.toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/brag/settings'))
  })
})
