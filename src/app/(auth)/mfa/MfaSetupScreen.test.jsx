import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@shared/components/ui/Button'
import MfaSetupScreen from './MfaSetupScreen'

const handleResend = vi.fn()

vi.mock('@mfa/hooks/useMfaSetupFlow', () => ({
  useMfaSetupFlow: () => ({
    step: 1,
    email: 'ada@example.com',
    otpCode: {
      digits: ['', '', '', '', '', ''],
      state: 'idle',
      handleChange: vi.fn(),
      handleKeyDown: vi.fn(),
      handlePaste: vi.fn(),
    },
    otpRefs: { current: [] },
    resendTimer: 0,
    handleResend,
  }),
}))

vi.mock('@shared/components/MfaOtpStep', () => ({
  default: ({ onResend }) => <Button type="button" onClick={onResend}>Resend code</Button>,
}))

vi.mock('@shared/components/MfaSuccessStep', () => ({
  default: () => <div>Done</div>,
}))

vi.mock('@shared/components/MfaTotpStep', () => ({
  default: () => <div>Totp</div>,
}))

describe('MfaSetupScreen', () => {
  it('wires resend actions to the resend handler instead of the timer reset helper', async () => {
    const user = userEvent.setup()

    render(<MfaSetupScreen />)
    await user.click(screen.getByRole('button', { name: /resend code/i }))

    expect(handleResend).toHaveBeenCalledTimes(1)
  })
})
