import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SignupScreen from './SignupScreen'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the first signup step', () => {
    render(<SignupScreen />)

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Aside')).toBeInTheDocument()
  })
})
