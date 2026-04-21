import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@features/brag/components/BragRail', () => ({
  default: () => <nav aria-label="Brag navigation" />,
}))

vi.mock('@features/brag/components/TotpSetupPanel', () => ({
  default: () => <div id="totp-setup">TOTP setup</div>,
}))

vi.mock('@features/brag/components/DeleteAccountModal', () => ({
  default: () => null,
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch: vi.fn(),
}))

describe('BragSettings integration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'true'
    process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED = 'false'
    localStorage.clear()
  })

  it('renders enabled SSO as active beside the hydrated profile', async () => {
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: false }), { status: 200 }))
    render(<BragSettings />)

    const row = screen.getByText('Google').closest('.bss-sso-row')

    expect(screen.getByText('Single sign-on')).toBeInTheDocument()
    expect(within(row).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(within(row).getByText('ada@example.com')).toBeInTheDocument()
    expect(within(row).getByLabelText('Google single sign-on is active')).toHaveTextContent('Active')
    expect(screen.queryByText('Microsoft')).not.toBeInTheDocument()
    expect(screen.queryByText('Two-factor authentication')).not.toBeInTheDocument()
    expect(screen.queryByText(/authenticator setup required/i)).not.toBeInTheDocument()
  })

  it('hides SSO status when the account did not use SSO', async () => {
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: false }), { status: 200 }))
    render(<BragSettings />)

    expect(screen.queryByText('Single sign-on')).not.toBeInTheDocument()
    expect(screen.queryByText('Google')).not.toBeInTheDocument()
  })

  it('renders MFA setup when SSO and authenticator MFA are not configured', async () => {
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: false }), { status: 200 }))
    render(<BragSettings />)

    expect(screen.getByText(/authenticator setup required/i)).toBeInTheDocument()
    expect(screen.getByText(/set up an authenticator app to unlock the rest of clausule/i)).toBeInTheDocument()
    expect(screen.getByText('Authenticator app').closest('.bss-mfa-row')).not.toHaveClass('bss-mfa-row--needs-setup')
    expect(screen.queryByLabelText('Authenticator app is not set up')).not.toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
  })

  it('green-highlights MFA setup when MFA is missing after non-OTP auth', async () => {
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'false'
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: false })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: false }), { status: 200 }))
    render(<BragSettings />)

    expect(screen.getByText('Authenticator app').closest('.bss-mfa-row')).not.toHaveClass('bss-mfa-row--needs-setup')
    expect(screen.getByText(/authenticator setup required/i).closest('.bss-totp-empty')).toHaveClass('bss-totp-empty--required')
  })

  it('shows active two-factor authentication when authenticator MFA is enabled', async () => {
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: true }), { status: 200 }))
    render(<BragSettings />)

    expect(screen.getByText('Two-factor authentication')).toBeInTheDocument()
    expect(screen.getByText('Authenticator app')).toBeInTheDocument()
    expect(screen.getByLabelText('Authenticator app is active')).toHaveTextContent('Active')
    expect(screen.queryByText(/authenticator setup required/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /set up/i })).not.toBeInTheDocument()
  })

  it('shows the name in the sidebar instead of falling back to email', async () => {
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: '',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: true }), { status: 200 }))
    render(<BragSettings />)

    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.queryByText('ada@example.com', { selector: '.be-sidebar-name' })).not.toBeInTheDocument()
  })

  it('does not derive the sidebar name from email when profile names are missing', async () => {
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: '',
      lastName: '',
      email: 'postbox.adrian+8@gmail.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: true }), { status: 200 }))
    render(<BragSettings />)

    expect(screen.getByText('Your profile', { selector: '.be-sidebar-name' })).toBeInTheDocument()
    expect(screen.queryByText('Postbox Adrian', { selector: '.be-sidebar-name' })).not.toBeInTheDocument()
  })

  it('refreshes the sidebar name from the saved profile row', async () => {
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: '',
      lastName: '',
      email: 'postbox.adrian+8@gmail.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockImplementation((url) => Promise.resolve(new Response(JSON.stringify(
      url === '/api/auth/profile'
        ? { firstName: 'awerwer', lastName: 'sadfasd', email: 'postbox.adrian+8@gmail.com' }
        : { configured: true }
    ), { status: 200 })))
    render(<BragSettings />)

    await waitFor(() => expect(screen.getByText('awerwer sadfasd', { selector: '.be-sidebar-name' })).toBeInTheDocument())
    expect(screen.queryByText('Your profile', { selector: '.be-sidebar-name' })).not.toBeInTheDocument()
  })

  it('renders reminder delivery and frequency choices on security settings', async () => {
    const user = userEvent.setup()
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: true }), { status: 200 }))
    render(<BragSettings />)

    expect(screen.getByText('Reminder preferences')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /email/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /weekly/i })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: /sms/i }))
    await user.click(screen.getByRole('radio', { name: /quarterly/i }))

    expect(screen.getByText('SMS · quarterly')).toBeInTheDocument()
  })

  it('uses the saved TOTP status to correct stale MFA settings', async () => {
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'false'
    const { useProfileStore } = await import('@features/auth/store/useProfileStore')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockImplementation((url) => Promise.resolve(new Response(JSON.stringify(
      url === '/api/auth/profile'
        ? { firstName: 'Postbox', lastName: 'Adrian', email: 'postbox.adrian+8@gmail.com' }
        : { configured: true }
    ), { status: 200 })))
    useProfileStore.getState().setProfile({
      firstName: 'Postbox',
      lastName: 'Adrian',
      email: 'postbox.adrian+8@gmail.com',
    })
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true })
    useProfileStore.setState({ hasSecuritySnapshot: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    render(<BragSettings />)

    await waitFor(() => expect(screen.getByLabelText('Authenticator app is active')).toHaveTextContent('Active'))
    expect(screen.getByText('Postbox Adrian')).toBeInTheDocument()
    expect(screen.queryByText(/authenticator setup required/i)).not.toBeInTheDocument()
  })
})
