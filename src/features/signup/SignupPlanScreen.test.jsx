import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import SignupPlanScreen from './SignupPlanScreen'

const push = vi.fn()
const scrollTo = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@shared/components/SignupProgress', () => ({
  default: () => <div>signup progress</div>,
}))

vi.mock('@shared/components/SignupStepPayment', () => ({
  default: ({ accountData, onNext, onBack }) => (
    <div>
      <span>payment:{accountData.email}</span>
      <button type="button" onClick={onNext}>next</button>
      <button type="button" onClick={onBack}>back</button>
    </div>
  ),
}))

describe('SignupPlanScreen', () => {
  beforeEach(() => {
    push.mockClear()
    scrollTo.mockClear()
    window.scrollTo = scrollTo
  })

  it('routes forward and back with the account data', async () => {
    const user = userEvent.setup()

    render(<SignupPlanScreen accountData={{ email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' }} />)

    await user.click(screen.getByRole('button', { name: 'next' }))
    await user.click(screen.getByRole('button', { name: 'back' }))

    expect(push).toHaveBeenCalledWith('/signup/done?email=ada%40example.com')
    expect(push).toHaveBeenCalledWith('/signup?email=ada%40example.com&firstName=Ada&lastName=Lovelace')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
