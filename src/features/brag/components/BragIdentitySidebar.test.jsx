import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import BragIdentitySidebar from './BragIdentitySidebar'

const logout = vi.fn()

vi.mock('@features/auth/context/AuthContext', () => ({
  useAuth: () => ({ logout }),
}))

describe('BragIdentitySidebar', () => {
  beforeEach(() => {
    logout.mockClear()
    useProfileStore.getState().clearProfile()
  })

  it('renders child menus for resume and feedback history', async () => {
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })

    render(<BragIdentitySidebar activePage="feedback" activeChildPage="feedback-history" eyebrow="Clausule · Feedback" ariaLabel="Sidebar navigation" />)

    expect(screen.getByRole('complementary', { name: /sidebar navigation/i })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /personal details/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /security/i })).toHaveAttribute('href', '/brag/settings')
    expect(screen.getByRole('link', { name: /your entries/i })).toHaveAttribute('href', '/brag')
    expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute('href', '/brag/resume')
    expect(screen.getByRole('link', { name: /^feedback$/i })).toHaveAttribute('href', '/brag/feedback')
    expect(screen.getByRole('link', { name: /feedback history/i })).toHaveAttribute('href', '/brag/feedback/history')
    expect(screen.getByRole('link', { name: /feedback history/i })).toHaveAttribute('aria-current', 'page')

    const user = (await import('@testing-library/user-event')).default.setup()
    await user.click(screen.getByRole('button', { name: /log out/i }))
    expect(logout).toHaveBeenCalledTimes(1)
  })
})
