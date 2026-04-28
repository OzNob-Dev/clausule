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

  it('renders the standalone sidebar navigation for real routes only', async () => {
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })

    render(<BragIdentitySidebar activePage="profile" eyebrow="Clausule · Profile" ariaLabel="Sidebar navigation" />)

    expect(screen.getByRole('complementary', { name: /sidebar navigation/i })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /personal details/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /security/i })).toHaveAttribute('href', '/brag/settings')
    expect(screen.getByRole('link', { name: /your entries/i })).toHaveAttribute('href', '/brag')
    expect(screen.getByRole('link', { name: /feedback/i })).toHaveAttribute('href', '/brag/feedback')
    expect(screen.queryByText(/templates/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/help center/i)).not.toBeInTheDocument()

    const user = (await import('@testing-library/user-event')).default.setup()
    await user.click(screen.getByRole('button', { name: /log out/i }))
    expect(logout).toHaveBeenCalledTimes(1)
  })
})
