import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SignInEmailForm from './SignInEmailForm'

describe('SignInEmailForm', () => {
  it('shows validation feedback, suggestion actions, and submits', async () => {
    const user = userEvent.setup()
    const onAcceptSuggestion = vi.fn()
    const onSubmit = vi.fn((event) => event.preventDefault())

    render(
      <SignInEmailForm
        email="jordan@gmial.com"
        result={{ valid: false, error: null, suggestion: 'jordan@gmail.com' }}
        showFeedback
        isChecking={false}
        btnLabel="Continue"
        ssoError="SSO unavailable"
        submitError="Try again"
        onAcceptSuggestion={onAcceptSuggestion}
        onBlur={vi.fn()}
        onChange={vi.fn()}
        onPaste={vi.fn()}
        onSubmit={onSubmit}
      />
    )

    expect(screen.getByText('SSO unavailable')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'jordan@gmail.com' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'jordan@gmail.com' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onAcceptSuggestion).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
