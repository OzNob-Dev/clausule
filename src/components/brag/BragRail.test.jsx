import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BragRail from './BragRail'
import { useProfileStore } from '@/stores/useProfileStore'

const push = vi.fn()
const logout = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout }),
}))

describe('BragRail integration', () => {
  beforeEach(() => {
    push.mockClear()
    logout.mockClear()
    useProfileStore.getState().clearProfile()
  })

  it('renders initials from the shared profile store', () => {
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    })

    render(<BragRail activePage="brag" />)

    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('navigates to settings from the brag page', async () => {
    const user = userEvent.setup()

    render(<BragRail activePage="brag" />)
    await user.click(screen.getByRole('button', { name: /settings/i }))

    expect(push).toHaveBeenCalledWith('/brag/settings')
  })

  it('delegates sign out to auth context', async () => {
    const user = userEvent.setup()

    render(<BragRail activePage="brag" />)
    await user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
