import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SignInScreen from './SignInScreen'

const { replace, apiFetch } = vi.hoisted(() => ({
  replace: vi.fn(),
  apiFetch: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch,
}))

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
    replace.mockReset()
    apiFetch.mockReset()
    apiFetch.mockResolvedValue({ ok: false })
    document.cookie = 'clausule_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('redirects active sessions to the brag screen', async () => {
    document.cookie = 'clausule_session=active; path=/'
    apiFetch.mockResolvedValue({ ok: true })

    render(<SignInScreen />)

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/auth/me')
      expect(replace).toHaveBeenCalledWith('/brag')
    })
  })
})
