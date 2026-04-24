import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SignInScreen from './SignInScreen'

vi.mock('@features/auth/hooks/useSignInFlow', () => ({
  useSignInFlow: () => ({
    step: 'email',
    email: '',
    result: { valid: true, suggestion: '' },
    showFeedback: false,
    isChecking: false,
    isNewAccount: false,
    btnLabel: 'Login',
    ssoError: null,
    acceptSuggestion: vi.fn(),
    setTouched: vi.fn(),
    handleEmailChange: vi.fn(),
    handlePaste: vi.fn(),
    handleSubmit: vi.fn(),
  }),
}))

vi.mock('@features/auth/components/SignInBrandPanel', () => ({
  default: () => <div>Brand</div>,
}))

vi.mock('@features/auth/components/SignInEmailForm', () => ({
  default: () => <div>Form</div>,
}))

vi.mock('@features/auth/components/SignUpPrompt', () => ({
  default: () => <div>Prompt</div>,
}))

vi.mock('@features/auth/components/SsoButtons', () => ({
  default: () => <div>SSO</div>,
}))

vi.mock('@features/mfa/components/MfaLoginEmailStep', () => ({
  default: () => <div>Email MFA</div>,
}))

vi.mock('@features/mfa/components/MfaLoginAppStep', () => ({
  default: () => <div>App MFA</div>,
}))

describe('SignInScreen', () => {
  beforeEach(() => {
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the email sign-in flow when no MFA step is active', () => {
    render(<SignInScreen />)

    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Form')).toBeInTheDocument()
    expect(screen.getByText('SSO')).toBeInTheDocument()
  })
})
