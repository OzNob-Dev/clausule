import React from 'react'
import { screen } from '@testing-library/react'
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
})
