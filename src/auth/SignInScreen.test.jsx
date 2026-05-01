import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SignInScreen from './SignInScreen'

vi.mock('@auth/hooks/useSignInFlow', () => ({
  useSignInFlow: () => ({
    step: 'email',
    email: '',
    result: { valid: true, suggestion: '' },
    showFeedback: false,
    isChecking: false,
    btnLabel: 'Login',
    ssoError: null,
    submitError: null,
    acceptSuggestion: vi.fn(),
    handleEmailBlur: vi.fn(),
    handleEmailChange: vi.fn(),
    handlePaste: vi.fn(),
    handleSubmit: vi.fn(),
    submitOtp: vi.fn(),
    submitApp: vi.fn(),
    verifyError: null,
  }),
}))

vi.mock('@shared/components/ui/SignInEmailForm', () => ({
  default: () => <div>Form</div>,
}))

vi.mock('@shared/components/ui/SignUpPrompt', () => ({
  default: () => <div>Prompt</div>,
}))

vi.mock('@shared/components/ui/SsoButtons', () => ({
  default: () => <div>SSO</div>,
}))

vi.mock('@shared/components/MfaLoginEmailStep', () => ({
  default: () => <div>Email MFA</div>,
}))

vi.mock('@shared/components/MfaLoginAppStep', () => ({
  default: () => <div>App MFA</div>,
}))

describe('SignInScreen', () => {
  beforeEach(() => {
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the email sign-in flow when no MFA step is active', () => {
    const { container } = render(<SignInScreen />)

    expect(container.firstChild).toHaveClass('su-narrow', 'su-auth-stack', 'page-enter')
    expect(screen.getByText('Form')).toBeInTheDocument()
    expect(screen.getByText('SSO')).toBeInTheDocument()
  })
})
