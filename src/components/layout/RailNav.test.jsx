import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RailNav } from './RailNav'
import { useProfileStore } from '@/stores/useProfileStore'

const logout = vi.fn()
let pathname = '/dashboard'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout }),
}))

describe('RailNav MFA lock', () => {
  beforeEach(() => {
    pathname = '/dashboard'
    logout.mockClear()
    localStorage.clear()
    useProfileStore.getState().clearProfile()
  })

  it('hides app links and keeps security settings available when MFA is missing', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: false })

    render(<RailNav />)

    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /search entries/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /escalated/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /security settings/i })).toHaveAttribute('href', '/brag/settings')
  })

  it('shows app links after MFA is configured', () => {
    useProfileStore.getState().setSecurity({ authenticatorAppConfigured: true })

    render(<RailNav />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings')
  })
})
