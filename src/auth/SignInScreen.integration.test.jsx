import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'
import SignInScreen from './SignInScreen'

const push = vi.fn()
const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}))

describe('SignInScreen integration', () => {
  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    process.env.NEXT_PUBLIC_SSO_GOOGLE_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_MICROSOFT_ENABLED = 'false'
    process.env.NEXT_PUBLIC_SSO_APPLE_ENABLED = 'false'
  })

  it('surfaces send-code failures instead of failing silently', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Rate limited for now' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    }))

    renderWithQueryClient(<SignInScreen />)

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/rate limited for now/i)
    expect(screen.queryByRole('heading', { name: /verify your code/i })).not.toBeInTheDocument()
  })

  it('redirects signup-needed sign-ins without persisting verification tokens in browser storage', async () => {
    const user = userEvent.setup()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    global.fetch = vi.fn(async (input) => {
      if (String(input).includes('/api/auth/send-code')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ nextStep: 'signup', verificationToken: 'signup-token' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    renderWithQueryClient(<SignInScreen />)

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: /login/i }))
    await user.type(await screen.findByLabelText(/digit 1 of 6/i), '1')
    await user.type(screen.getByLabelText(/digit 2 of 6/i), '2')
    await user.type(screen.getByLabelText(/digit 3 of 6/i), '3')
    await user.type(screen.getByLabelText(/digit 4 of 6/i), '4')
    await user.type(screen.getByLabelText(/digit 5 of 6/i), '5')
    await user.type(screen.getByLabelText(/digit 6 of 6/i), '6')

    expect(await screen.findByRole('button', { name: /verify your code/i })).toBeDisabled()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/signup?email=ada%40example.com'))
    expect(setItem).not.toHaveBeenCalledWith(expect.stringMatching(/^signup_verification:/), expect.any(String))
  })
})
