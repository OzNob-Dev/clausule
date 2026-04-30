import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MfaOtpStep from './MfaOtpStep'

function renderOtpStep(overrides = {}) {
  const props = {
    email: 'jordan@example.com',
    otp: ['', '', '', '', '', ''],
    otpRefs: { current: [] },
    otpState: 'idle',
    resendTimer: 0,
    onChange: vi.fn(),
    onKeyDown: vi.fn(),
    onPaste: vi.fn(),
    onResend: vi.fn(),
    ...overrides,
  }

  render(<MfaOtpStep {...props} />)
  return props
}

describe('MfaOtpStep', () => {
  it('renders the target email and six digit inputs', () => {
    renderOtpStep()

    expect(screen.getByText('jordan@example.com')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Digit \d of 6/)).toHaveLength(6)
  })

  it('calls onResend when resend is available', async () => {
    const user = userEvent.setup()
    const props = renderOtpStep()

    await user.click(screen.getByRole('button', { name: /resend code/i }))

    expect(props.onResend).toHaveBeenCalledTimes(1)
  })

  it('shows errors from the parent verifier state', () => {
    renderOtpStep({ otpState: 'error' })

    expect(screen.getByRole('alert')).toHaveTextContent(/incorrect code/i)
  })
})
