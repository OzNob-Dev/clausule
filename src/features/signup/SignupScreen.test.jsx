import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SignupScreen from './SignupScreen'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@shared/components/SignupProgress', () => ({
  default: () => <div>Progress</div>,
}))

vi.mock('@shared/components/SignupStepAccount', () => ({
  default: () => <div>Account</div>,
}))

describe('SignupScreen', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the first signup step', () => {
    render(<SignupScreen />)

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })
})
