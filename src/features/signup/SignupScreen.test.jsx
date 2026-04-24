import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SignupScreen from './SignupScreen'

const { replace, apiFetch } = vi.hoisted(() => ({
  replace: vi.fn(),
  apiFetch: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch,
}))

vi.mock('@features/signup/context/SignupContext', () => ({
  SignupProvider: ({ children }) => <>{children}</>,
  useSignup: () => ({
    step: 1,
    setStep: vi.fn(),
    step1Data: {},
    setStep1Data: vi.fn(),
    step2Data: {},
    setStep2Data: vi.fn(),
    completePayment: vi.fn(),
  }),
}))

vi.mock('@features/auth/store/useProfileStore', () => ({
  useProfileStore: (selector) => selector({ setProfile: vi.fn() }),
}))

vi.mock('@features/signup/components/SignupAside', () => ({
  default: () => <div>Aside</div>,
}))

vi.mock('@features/signup/components/SignupProgress', () => ({
  default: () => <div>Progress</div>,
}))

vi.mock('@features/signup/components/SignupStepAccount', () => ({
  default: () => <div>Account</div>,
}))

vi.mock('@features/signup/components/SignupStepDone', () => ({
  default: () => <div>Done</div>,
}))

vi.mock('@features/signup/components/SignupStepPayment', () => ({
  default: () => <div>Payment</div>,
}))

describe('SignupScreen', () => {
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

    render(<SignupScreen />)

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/auth/me')
      expect(replace).toHaveBeenCalledWith('/brag')
    })
  })
})
