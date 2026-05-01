import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SignupPanelSummary from './SignupPanelSummary'
import SignupPlanPanelContent from './SignupPlanPanelContent'
import { BackBtn, CtaBtn } from '@shared/components/ui/SignupButtons'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { BackIcon } from '@shared/components/ui/icon/BackIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'
import SignupProgress from './SignupProgress'
import SignupStepDone from './SignupStepDone'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/signup/plan',
  useSearchParams: () => ({ get: (key) => (key === 'email' ? 'ada@example.com' : null) }),
}))

describe('Signup component integration', () => {
  it('renders static signup support components', () => {
    const onBack = vi.fn()

    render(
      <>
        <SignupPanelSummary />
        <SignupPlanPanelContent />
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
    expect(screen.getByText(/What happens next/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('routes from the done step to MFA setup', async () => {
    const user = userEvent.setup()
    push.mockClear()

    render(<SignupStepDone email="ada@example.com" />)
    await user.click(screen.getByRole('button', { name: /set up multi-factor authentication/i }))

    expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith('/settings')
  })
})
