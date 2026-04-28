import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BragRail from './BragRail'
import { useProfileStore } from '@features/auth/store/useProfileStore'

const logout = vi.fn()

vi.mock('@features/auth/context/AuthContext', () => ({
  useAuth: () => ({ logout }),
}))

describe('BragRail integration', () => {
  beforeEach(() => {
    logout.mockClear()
    useProfileStore.getState().clearProfile()
  })

  it('renders the same sidebar routes as the standalone shell', () => {
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })

    render(<BragRail activePage="feedback" />)

    expect(screen.getByRole('link', { name: /personal details/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /feedback/i })).toHaveAttribute('href', '/brag/feedback')
    expect(screen.getByRole('link', { name: /feedback/i })).toHaveAttribute('aria-current', 'page')
  })

  it('delegates sign out to auth context', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()

    render(<BragRail activePage="brag" />)
    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
