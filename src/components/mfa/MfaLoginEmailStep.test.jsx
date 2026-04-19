import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MfaLoginEmailStep from './MfaLoginEmailStep'

function renderStep(overrides = {}) {
  const props = {
    email: 'jordan@acme.com',
    otp: ['', '', '', '', '', ''],
    otpRefs: { current: [] },
    otpState: 'idle',
    expirySeconds: 598,
    resendTimer: 0,
    onBack: vi.fn(),
    onChange: vi.fn(),
    onKeyDown: vi.fn(),
    onPaste: vi.fn(),
    onVerify: vi.fn(),
    onResend: vi.fn(),
    ...overrides,
  }
  render(<MfaLoginEmailStep {...props} />)
  return props
}

describe('MfaLoginEmailStep', () => {
  it('renders the OTP email login mockup content', () => {
    renderStep()

    expect(screen.getByText('Check your')).toBeInTheDocument()
    expect(screen.getByText('Verify your code')).toBeInTheDocument()
    expect(screen.getByText('jo***@acme.com')).toBeInTheDocument()
    expect(screen.queryByText('jordan@acme.com')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Example of the email you received')).toBeInTheDocument()
    expect(screen.getByText('noreply@clausule.com')).toBeInTheDocument()
    expect(screen.getByLabelText('6-digit code placeholder')).toHaveTextContent('******')
    expect(screen.getByRole('group', { name: /enter code/i })).toBeInTheDocument()
    expect(screen.getByText(/9:58/)).toBeInTheDocument()
  })

  it('calls back, verify, and resend handlers', () => {
    const props = renderStep()

    fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }))
    fireEvent.click(screen.getByRole('button', { name: /verify your code/i }))
    fireEvent.click(screen.getByRole('button', { name: /resend code/i }))

    expect(props.onBack).toHaveBeenCalledTimes(1)
    expect(props.onVerify).toHaveBeenCalledTimes(1)
    expect(props.onResend).toHaveBeenCalledTimes(1)
  })
})
