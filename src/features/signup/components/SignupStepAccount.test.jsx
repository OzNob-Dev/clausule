import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignupStepAccount from './SignupStepAccount'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const initialData = {
  firstName: '',
  lastName: '',
  email: '',
  agreed: false,
  emailVerificationToken: '',
}

describe('SignupStepAccount integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
    global.fetch = vi.fn(async (input) => {
      if (String(input).includes('/api/auth/send-code')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ ok: true, verificationToken: 'signup-token' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    })
  })

  it('requires first name, valid email, and terms agreement before continuing', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    renderWithQueryClient(<SignupStepAccount initialData={initialData} onNext={onNext} />)

    await user.click(screen.getByRole('button', { name: /send verification code/i }))

    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByText(/please agree/i)).toBeInTheDocument()
  })

  it('passes normalized account data when the step is valid', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    renderWithQueryClient(<SignupStepAccount initialData={initialData} onNext={onNext} />)

    await user.type(screen.getByPlaceholderText('Jordan'), 'Ada')
    await user.type(screen.getByPlaceholderText('Ellis'), 'Lovelace')
    await user.type(screen.getByPlaceholderText('you@email.com'), 'ada@example.com')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /send verification code/i }))
    await user.type(screen.getByPlaceholderText('123456'), '123456')
    await user.click(screen.getByRole('button', { name: /verify email to continue/i }))

    await waitFor(() => expect(onNext).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      emailVerificationToken: 'signup-token',
    }))
  })

  it('renders prefilled SSO account details', () => {
    renderWithQueryClient(
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

  it('locks redirected email and hides the email signup divider', async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <SignupStepAccount
        emailLocked
        hideSso
        initialData={{
          firstName: '',
          lastName: '',
          email: 'newperson@example.com',
          agreed: false,
        }}
        onNext={vi.fn()}
      />
    )

    const email = screen.getByPlaceholderText('you@email.com')

    expect(email).toHaveValue('newperson@example.com')
    expect(email).toHaveAttribute('readonly')
    expect(screen.queryByText(/or sign up with email/i)).not.toBeInTheDocument()

    await user.type(email, 'edited')

    expect(email).toHaveValue('newperson@example.com')
  })

  it('keeps in-progress edits when the parent rerenders with an equivalent initial object', async () => {
    const user = userEvent.setup()
    const { rerender } = renderWithQueryClient(<SignupStepAccount initialData={{ ...initialData }} onNext={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Jordan'), 'Ada')

    rerender(<SignupStepAccount initialData={{ ...initialData }} onNext={vi.fn()} />)

    expect(screen.getByPlaceholderText('Jordan')).toHaveValue('Ada')
  })

  it('renders real terms and privacy links instead of placeholder anchors', () => {
    renderWithQueryClient(<SignupStepAccount initialData={initialData} onNext={vi.fn()} />)

    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy')
  })
})
