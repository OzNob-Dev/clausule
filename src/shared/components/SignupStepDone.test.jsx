import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SignupStepDone from './SignupStepDone'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@shared/components/ui/SignupButtons', () => ({
  CtaBtn: ({ children, onClick, disabled }) => <button type="button" disabled={disabled} onClick={onClick}>{children}</button>,
}))

vi.mock('@shared/components/ui/icon/ArrowIcon', () => ({
  ArrowIcon: () => <span>arrow</span>,
}))

vi.mock('@shared/components/ui/icon/CheckIcon', () => ({
  CheckIcon: () => <span>check</span>,
}))

describe('SignupStepDone', () => {
  it('links to support and continues into settings', async () => {
    const user = userEvent.setup()

    render(<SignupStepDone email="ada@example.com" />)

    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /set up multi-factor authentication/i }))
    expect(push).toHaveBeenCalledWith('/settings')
  })
})
