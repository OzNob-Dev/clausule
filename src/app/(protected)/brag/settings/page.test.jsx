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
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false })

    const { default: BragSettings } = await import('./page')
    render(<BragSettings />)

    const row = screen.getByText('Google').closest('.bss-sso-row')

    expect(screen.getByText('Single sign-on')).toBeInTheDocument()
    expect(within(row).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(within(row).getByText('ada@example.com')).toBeInTheDocument()
    expect(within(row).getByLabelText('Google single sign-on is active')).toHaveTextContent('Active')
    expect(screen.queryByText('Microsoft')).not.toBeInTheDocument()
    expect(screen.getByText(/no authenticator app connected yet/i)).toBeInTheDocument()
  })
})
