import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SignupStepAccount from './SignupStepAccount'

const initialData = {
  firstName: '',
  lastName: '',
  email: '',
  agreed: false,
}

describe('SignupStepAccount integration', () => {
  it('requires first name, valid email, and terms agreement before continuing', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    render(<SignupStepAccount initialData={initialData} onNext={onNext} />)

    await user.click(screen.getByRole('button', { name: /continue to payment/i }))

    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText(/please agree/i)).toBeInTheDocument()
  })

  it('passes normalized account data when the step is valid', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    render(<SignupStepAccount initialData={initialData} onNext={onNext} />)

    await user.type(screen.getByPlaceholderText('Jordan'), 'Ada')
    await user.type(screen.getByPlaceholderText('Ellis'), 'Lovelace')
    await user.type(screen.getByPlaceholderText('you@email.com'), 'ada@example.com')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /continue to payment/i }))

    expect(onNext).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })
  })

  it('renders prefilled SSO account details', () => {
    render(
      <SignupStepAccount
        initialData={{
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.com',
          agreed: false,
        }}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByPlaceholderText('Jordan')).toHaveValue('Ada')
    expect(screen.getByPlaceholderText('Ellis')).toHaveValue('Lovelace')
    expect(screen.getByPlaceholderText('you@email.com')).toHaveValue('ada@example.com')
  })
})
