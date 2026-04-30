import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SignupDoneScreen from './SignupDoneScreen'

vi.mock('@shared/components/SignupProgress', () => ({
  default: () => <div>signup progress</div>,
}))

vi.mock('@shared/components/SignupStepDone', () => ({
  default: ({ email }) => <div>done:{email}</div>,
}))

describe('SignupDoneScreen', () => {
  it('renders the done step for the provided email', () => {
    render(<SignupDoneScreen email="ada@example.com" />)

    expect(screen.getByText('signup progress')).toBeInTheDocument()
    expect(screen.getByText('done:ada@example.com')).toBeInTheDocument()
  })
})
