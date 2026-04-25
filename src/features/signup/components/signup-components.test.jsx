import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SignupAside from './SignupAside'
import { BackBtn, CtaBtn } from './SignupButtons'
import { ArrowIcon, BackIcon, CheckIcon } from './SignupIcons'
import SignupProgress from './SignupProgress'
import SignupStepDone from './SignupStepDone'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('Signup component integration', () => {
  it('renders static signup support components', () => {
    const onBack = vi.fn()

    render(
      <>
        <SignupAside />
        <SignupProgress step={2} />
        <CtaBtn>Continue</CtaBtn>
        <BackBtn onClick={onBack} />
        <CheckIcon />
        <ArrowIcon />
        <BackIcon />
      </>
    )

    expect(screen.getByText('$5.00')).toBeInTheDocument()
    expect(screen.getByText('Plan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('routes from the done step to MFA setup', async () => {
    const user = userEvent.setup()
    push.mockClear()

    render(<SignupStepDone email="ada@example.com" />)
    await user.click(screen.getByRole('button', { name: /set up multi-factor authentication/i }))

    expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith('/brag/settings')
  })
})
