import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileStore } from '@features/auth/store/useProfileStore'

const refresh = vi.fn()
const updateUser = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
  useRouter: () => ({ refresh }),
}))

vi.mock('@features/auth/context/AuthContext', () => ({
  useAuth: () => ({ updateUser, logout: vi.fn() }),
}))

describe('ProfileScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useProfileStore.getState().clearProfile()
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      mobile: '+61 400 000 000',
      jobTitle: 'Engineer',
      department: 'Platform',
    })
    useProfileStore.getState().setSecurity({
      authenticatorAppConfigured: true,
      authenticatedWithOtp: true,
      ssoConfigured: false,
    })
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
  })

  it('opens the verification modal and sends the email code when contact details change', async () => {
    const { default: ProfileScreen } = await import('./ProfileScreen')
    const user = userEvent.setup()

    render(<ProfileScreen />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'ada@new.example.com')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByRole('heading', { name: /verify changes/i })).toBeInTheDocument()
    expect(screen.getByText(/a code was sent to ada@new\.example\.com/i)).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/send-code', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
    }))
  })

  it('shows the brag rail with profile selected', async () => {
    const { default: ProfileScreen } = await import('./ProfileScreen')

    render(<ProfileScreen />)

    const profileLink = screen.getByRole('link', { name: /profile/i })
    expect(profileLink).toHaveAttribute('href', '/profile')
    expect(profileLink).toHaveAttribute('aria-current', 'page')
  })
})
