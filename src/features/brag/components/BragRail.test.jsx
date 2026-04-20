import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BragRail from './BragRail'
import { useProfileStore } from '@features/auth/store/useProfileStore'

const logout = vi.fn()

vi.mock('@features/auth/context/AuthContext', () => ({
  useAuth: () => ({ logout }),
}))

describe('BragRail integration', () => {
  beforeEach(() => {
    logout.mockClear()
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED = 'false'
    useProfileStore.getState().clearProfile()
  })

  it('does not render a duplicate avatar in the rail', () => {
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })

    render(<BragRail activePage="brag" />)

    expect(screen.queryByText('AL')).not.toBeInTheDocument()
  })

  it('links to settings from the brag page', () => {
    render(<BragRail activePage="brag" />)

    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/brag/settings')
  })

  it('links to feedback capture from the rail', () => {
    render(<BragRail activePage="feedback" />)

    const feedbackLink = screen.getByRole('link', { name: /feedback/i })
    expect(feedbackLink).toHaveAttribute('href', '/brag/feedback')
    expect(feedbackLink).toHaveAttribute('aria-current', 'page')
  })

  it('delegates sign out to auth context', async () => {
    const userEvent = await import('@testing-library/user-event')
    const user = userEvent.default.setup()

    render(<BragRail activePage="brag" />)
    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('hides app navigation until authenticator setup is complete', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false })

    render(<BragRail activePage="settings" />)

    expect(screen.queryByRole('link', { name: /brag doc/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /feedback/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('hides app navigation when MFA is missing after non-OTP auth', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: false })

    render(<BragRail activePage="settings" />)

    expect(screen.queryByRole('link', { name: /brag doc/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument()
  })

  it('shows app navigation when SSO is configured without MFA', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true })

    render(<BragRail activePage="settings" />)

    expect(screen.getByRole('link', { name: /brag doc/i })).toHaveAttribute('href', '/brag')
    expect(screen.getByRole('link', { name: /feedback/i })).toHaveAttribute('href', '/brag/feedback')
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/brag/settings')
  })
})
