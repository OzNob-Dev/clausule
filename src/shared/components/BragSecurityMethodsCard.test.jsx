import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@shared/components/BragSecuritySetupPanel', () => ({
  default: () => <div>Mock setup</div>,
}))

import BragSecurityMethodsCard from './BragSecurityMethodsCard'

describe('BragSecurityMethodsCard', () => {
  it('shows the mockup rows and setup affordance', async () => {
    const user = userEvent.setup()
    const onToggleTotp = vi.fn()

    render(
      <BragSecurityMethodsCard
        authenticatorAppConfigured={false}
        hasSecuritySnapshot
        mfaRestrictionEnabled
        totpExpanded={false}
        onTotpDone={vi.fn()}
        onToggleTotp={onToggleTotp}
      />
    )

    expect(screen.getByText('Two-factor authentication')).toBeInTheDocument()
    expect(screen.getByText('Sign-in protection')).toBeInTheDocument()
    expect(screen.getByText('Email code')).toBeInTheDocument()
    expect(screen.getByText('Authenticator app')).toBeInTheDocument()
    expect(screen.getByText('Set up')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Authenticator setup required')

    await user.click(screen.getByRole('button', { name: 'Set up' }))
    expect(onToggleTotp).toHaveBeenCalledTimes(1)
  })

  it('shows the configured state', () => {
    render(
      <BragSecurityMethodsCard
        authenticatorAppConfigured
        hasSecuritySnapshot
        mfaRestrictionEnabled={false}
        totpExpanded={false}
        onTotpDone={vi.fn()}
        onToggleTotp={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Authenticator app is active')).toHaveTextContent('Active')
    expect(screen.queryByRole('button', { name: 'Set up' })).not.toBeInTheDocument()
  })
})
