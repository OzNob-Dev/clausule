import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

vi.mock('@shared/components/BragSecuritySetupPanel', () => ({
  default: () => <div id="totp-setup">TOTP setup</div>,
}))

vi.mock('@shared/components/DeleteAccountDialog', () => ({
  DeleteAccountDialog: () => null,
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch: vi.fn(),
}))

describe('BragSettings integration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('renders the mockup security surface with active rows', async () => {
    const { useProfileStore } = await import('@auth/store/useProfileStore')
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true, authenticatedWithOtp: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: true }), { status: 200 }))
    renderWithQueryClient(<BragSettings />)

    expect(screen.getByRole('heading', { name: 'Security settings' })).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Manage how you sign in to Clausule.')).toBeInTheDocument()
    expect(screen.getByText('Two-factor authentication')).toBeInTheDocument()
    expect(screen.getByText('Sign-in protection')).toBeInTheDocument()
    expect(screen.getByText('Email code')).toBeInTheDocument()
    expect(screen.getByLabelText('Email code is active')).toHaveTextContent('Active')
    expect(screen.getByText('Authenticator app')).toBeInTheDocument()
    expect(screen.getByLabelText('Authenticator app is active')).toHaveTextContent('Active')
    expect(screen.getByText('Danger zone')).toBeInTheDocument()
    expect(screen.getByText('Irreversible actions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument()
    expect(screen.queryByText('Single sign-on')).not.toBeInTheDocument()
  })

  it('shows the setup affordance when authenticator app is missing', async () => {
    const { useProfileStore } = await import('@auth/store/useProfileStore')
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockResolvedValue(new Response(JSON.stringify({ configured: false }), { status: 200 }))
    renderWithQueryClient(<BragSettings />)

    expect(screen.getByText(/set up an authenticator app to unlock the rest of clausule/i)).toBeInTheDocument()
    const user = userEvent.setup()
    const setup = screen.getByRole('button', { name: 'Set up' })
    await user.click(setup)
    expect(screen.getByText('TOTP setup')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('syncs the saved TOTP status into the page', async () => {
    const { useProfileStore } = await import('@auth/store/useProfileStore')
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, authenticatedWithOtp: true })

    const { default: BragSettings } = await import('./BragSettingsScreen')
    const { apiFetch } = await import('@shared/utils/api')
    apiFetch.mockImplementation((url) => Promise.resolve(new Response(JSON.stringify(
      url === '/api/auth/totp/status'
        ? { configured: true }
        : {}
    ), { status: 200 })))
    renderWithQueryClient(<BragSettings />)

    await waitFor(() => expect(screen.getByLabelText('Authenticator app is active')).toHaveTextContent('Active'))
    expect(screen.queryByRole('button', { name: 'Set up' })).not.toBeInTheDocument()
  })
})
