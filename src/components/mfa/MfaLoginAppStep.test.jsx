import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MfaLoginAppStep from './MfaLoginAppStep'

function renderStep() {
  render(
    <MfaLoginAppStep
      email="jordan@acme.com"
      otp={['', '', '', '', '', '']}
      otpRefs={{ current: [] }}
      otpState="idle"
      onBack={vi.fn()}
      onChange={vi.fn()}
      onKeyDown={vi.fn()}
      onPaste={vi.fn()}
      onVerify={vi.fn()}
      onUseRecovery={vi.fn()}
    />
  )
}

describe('MfaLoginAppStep', () => {
  it('renders the authenticator login mockup content', () => {
    renderStep()

    expect(screen.getByLabelText('Clausule')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument()
    expect(screen.getByText('Authenticator')).toBeInTheDocument()
    expect(screen.getByText('verification')).toBeInTheDocument()
    expect(screen.getByText('Enter your code')).toBeInTheDocument()
    expect(screen.getByText(/open your authenticator app/i)).toBeInTheDocument()
    expect(screen.getByText(/refreshes every 30s/i)).toBeInTheDocument()
    expect(screen.getByText('jo***@acme.com')).toBeInTheDocument()
    expect(screen.queryByText('jordan@acme.com')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /6-digit code/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verify authentication code/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /use a recovery code/i })).toBeInTheDocument()
    expect(screen.getByText(/totp standard/i)).toBeInTheDocument()
  })
})
