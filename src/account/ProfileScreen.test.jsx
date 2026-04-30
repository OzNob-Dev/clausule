import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileStore } from '@auth/store/useProfileStore'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const refresh = vi.fn()
const updateUser = vi.fn()
const saveProfileAction = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
  useRouter: () => ({ refresh }),
}))

vi.mock('@auth/context/AuthContext', () => ({
  useAuth: () => ({ updateUser, logout: vi.fn() }),
}))

vi.mock('@actions/account-actions', () => ({
  saveProfileAction: (...args) => saveProfileAction(...args),
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
    saveProfileAction.mockResolvedValue({
      ok: true,
      user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
      profile: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        mobile: '+61 400 000 000',
        jobTitle: 'Engineer',
        department: 'Platform',
      },
    })
  })

  it('renders the profile content with the shared shell and readonly email', async () => {
    const { default: ProfileScreen } = await import('./ProfileScreen')

    renderWithQueryClient(<ProfileScreen />)

    expect(screen.getByRole('heading', { name: 'Personal details' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly')
  })

  it('saves the profile without the verification modal', async () => {
    const { default: ProfileScreen } = await import('./ProfileScreen')
    const user = userEvent.setup()

    renderWithQueryClient(<ProfileScreen />)

    await user.clear(screen.getByLabelText('Mobile'))
    await user.type(screen.getByLabelText('Mobile'), '0401 234 567')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => expect(saveProfileAction).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: /send feedback/i })).toHaveClass('be-comp-save')
    expect(saveProfileAction).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      mobile: '0401 234 567',
      jobTitle: 'Engineer',
      department: 'Platform',
      mobileConfirmed: true,
      mobileConfirmation: '0401 234 567',
    }), expect.any(Object))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/profile saved/i))
  })

  it('resets edited fields back to the baseline', async () => {
    const { default: ProfileScreen } = await import('./ProfileScreen')
    const user = userEvent.setup()

    renderWithQueryClient(<ProfileScreen />)

    await user.clear(screen.getByLabelText('First name'))
    await user.type(screen.getByLabelText('First name'), 'Grace')
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByLabelText('First name')).toHaveValue('Ada')
    expect(screen.getByRole('button', { name: /send feedback/i })).toBeDisabled()
  })
})
