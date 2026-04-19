import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BragRail from './BragRail'
import { useProfileStore } from '@features/auth/store/useProfileStore'

const push = vi.fn()
const logout = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@features/auth/context/AuthContext', () => ({
  useAuth: () => ({ logout }),
}))

describe('BragRail integration', () => {
  beforeEach(() => {
    push.mockClear()
    logout.mockClear()
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED = 'false'
    useProfileStore.getState().clearProfile()
  })

  it('renders initials from the shared profile store', () => {
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })

    render(<BragRail activePage="brag" />)

    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('navigates to settings from the brag page', async () => {
    const user = userEvent.setup()

    render(<BragRail activePage="brag" />)
    await user.click(screen.getByRole('button', { name: /settings/i }))

    expect(push).toHaveBeenCalledWith('/brag/settings')
  })

  it('delegates sign out to auth context', async () => {
    const user = userEvent.setup()

    render(<BragRail activePage="brag" />)
    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('hides app navigation until authenticator setup is complete', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false })

    render(<BragRail activePage="settings" />)

    expect(screen.queryByRole('button', { name: /brag doc/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('hides app navigation when MFA is missing after non-OTP auth', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: false })

    render(<BragRail activePage="settings" />)

    expect(screen.queryByRole('button', { name: /brag doc/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
  })

  it('shows app navigation when SSO is configured without MFA', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true })

    render(<BragRail activePage="settings" />)

    expect(screen.getByRole('button', { name: /brag doc/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })
})
