import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RailNav } from './RailNav'

const logout = vi.fn()
let pathname = '/dashboard'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

describe('RailNav', () => {
  beforeEach(() => {
    pathname = '/dashboard'
    logout.mockClear()
    localStorage.clear()
  })

  it('hides app links when locked', () => {
    render(<RailNav locked onLogout={logout} />)

    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /search entries/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /escalated/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('shows app links when unlocked', () => {
    render(<RailNav onLogout={logout} />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings')
  })

  it('marks the active route', () => {
    pathname = '/settings'

    render(<RailNav onLogout={logout} />)

    expect(screen.getByRole('link', { name: /settings/i })).toHaveClass('nav-item--active')
  })

  it('calls the logout handler', () => {
    render(<RailNav onLogout={logout} />)

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
