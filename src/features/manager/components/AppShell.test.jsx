import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'
import { useProfileStore } from '@features/auth/store/useProfileStore'

const logout = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('@features/auth/context/AuthContext', () => ({
  useAuth: () => ({ logout }),
}))

describe('Manager AppShell', () => {
  beforeEach(() => {
    logout.mockClear()
    localStorage.clear()
    useProfileStore.getState().clearProfile()
  })

  it('hides manager navigation while MFA is required', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false })

    render(<AppShell><h1>Dashboard</h1></AppShell>)

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('shows manager navigation when SSO satisfies the security state', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false, ssoConfigured: true })

    render(<AppShell><h1>Dashboard</h1></AppShell>)

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
  })

  it('delegates logout to auth', () => {
    render(<AppShell><h1>Dashboard</h1></AppShell>)

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
