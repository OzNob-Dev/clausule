import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/brag/BragRail', () => ({
  default: () => <nav aria-label="Brag navigation" />,
}))

vi.mock('@/components/brag/TotpSetupPanel', () => ({
  default: () => <div id="totp-setup">TOTP setup</div>,
}))

vi.mock('@/components/brag/DeleteAccountModal', () => ({
  default: () => null,
}))

describe('BragSettings integration', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'true'
    process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED = 'false'
    localStorage.clear()
  })

  it('renders enabled SSO as active beside the hydrated profile', async () => {
    const { useProfileStore } = await import('@/stores/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./page')
    render(<BragSettings />)

    const row = screen.getByText('Google').closest('.bss-sso-row')

    expect(screen.getByText('Single sign-on')).toBeInTheDocument()
    expect(within(row).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(within(row).getByText('ada@example.com')).toBeInTheDocument()
    expect(within(row).getByLabelText('Google single sign-on is active')).toHaveTextContent('Active')
    expect(screen.queryByText('Microsoft')).not.toBeInTheDocument()
    expect(screen.getByText('Two-factor authentication')).toBeInTheDocument()
    expect(screen.getByText(/authenticator setup required/i).closest('.bss-totp-empty')).toHaveClass('bss-totp-empty--required')
  })

  it('hides SSO status when the account did not use SSO', async () => {
    const { useProfileStore } = await import('@/stores/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./page')
    render(<BragSettings />)

    expect(screen.queryByText('Single sign-on')).not.toBeInTheDocument()
    expect(screen.queryByText('Google')).not.toBeInTheDocument()
  })

  it('renders MFA setup when SSO and authenticator MFA are not configured', async () => {
    const { useProfileStore } = await import('@/stores/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./page')
    render(<BragSettings />)

    expect(screen.getByText(/authenticator setup required/i)).toBeInTheDocument()
    expect(screen.getByText(/set up an authenticator app to unlock the rest of clausule/i)).toBeInTheDocument()
    expect(screen.getByText('Authenticator app').closest('.bss-mfa-row')).toHaveClass('bss-mfa-row--needs-setup')
    expect(screen.queryByLabelText('Authenticator app is not set up')).not.toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
  })

  it('green-highlights MFA setup when MFA is missing after non-OTP auth', async () => {
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'false'
    const { useProfileStore } = await import('@/stores/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: false })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./page')
    render(<BragSettings />)

    expect(screen.getByText('Authenticator app').closest('.bss-mfa-row')).toHaveClass('bss-mfa-row--needs-setup')
    expect(screen.getByText(/authenticator setup required/i).closest('.bss-totp-empty')).toHaveClass('bss-totp-empty--required')
  })

  it('hides two-factor authentication when authenticator MFA is enabled', async () => {
    const { useProfileStore } = await import('@/stores/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./page')
    render(<BragSettings />)

    expect(screen.queryByText('Two-factor authentication')).not.toBeInTheDocument()
    expect(screen.queryByText('Authenticator app')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reconfigure/i })).not.toBeInTheDocument()
  })
})
