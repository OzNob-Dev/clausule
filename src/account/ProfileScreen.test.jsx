import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileStore } from '@auth/store/useProfileStore'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const refresh = vi.fn()
const updateUser = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
  useRouter: () => ({ refresh }),
}))

vi.mock('@auth/context/AuthContext', () => ({
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

    renderWithQueryClient(<ProfileScreen />)

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

    renderWithQueryClient(<ProfileScreen />)

    const profileLink = screen.getByRole('link', { name: /profile/i })
    expect(profileLink).toHaveAttribute('href', '/profile')
    expect(profileLink).toHaveAttribute('aria-current', 'page')
  })

  it('closes the verification modal after a successful confirmed save', async () => {
    const { default: ProfileScreen } = await import('./ProfileScreen')
    const user = userEvent.setup()

    global.fetch = vi.fn(async (input) => {
      if (String(input).includes('/api/auth/send-code')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (String(input).includes('/api/auth/profile')) {
        return new Response(JSON.stringify({
          profile: {
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@new.example.com',
            mobile: '+61 400 000 000',
            jobTitle: 'Engineer',
            department: 'Platform',
          },
          user: { email: 'ada@new.example.com' },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      if (String(input).includes('/api/auth/refresh')) {
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    })

    renderWithQueryClient(<ProfileScreen />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'ada@new.example.com')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    const dialog = await screen.findByRole('dialog', { name: /verify changes/i })

    await user.type(within(dialog).getByLabelText(/verification code/i), '123456')
    await user.click(within(dialog).getByRole('button', { name: /^save changes$/i }))

    await waitFor(() => expect(screen.queryByRole('heading', { name: /verify changes/i })).not.toBeInTheDocument())
    expect(screen.getByRole('status')).toHaveTextContent(/profile saved/i)
  })
})
