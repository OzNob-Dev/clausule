import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BragIdentitySidebar from './BragIdentitySidebar'
import { useProfileStore } from '@auth/store/useProfileStore'

const logout = vi.fn()
const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }))

vi.mock('@shared/components/ClientSignOutButton', () => ({
  default: () => <button type="button" onClick={logout}>Log out</button>,
}))

vi.mock('next/navigation', () => ({
  usePathname,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}))

describe('BragIdentitySidebar', () => {
  beforeEach(() => {
    logout.mockClear()
    usePathname.mockReturnValue('/settings')
    useProfileStore.getState().clearProfile()
  })

  it('renders child menus for resume and feedback history', async () => {
    usePathname.mockReturnValue('/feedback/history')
    render(<BragIdentitySidebar activePage="feedback" activeChildPage="feedback-history" eyebrow="Clausule · Feedback" ariaLabel="Sidebar navigation" profile={{ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }} />)

    expect(screen.getByRole('complementary', { name: /sidebar navigation/i })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /personal details/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /security/i })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('link', { name: /your entries/i })).toHaveAttribute('href', '/brag')
    expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute('href', '/resume')
    expect(screen.getByRole('link', { name: /^feedback$/i })).toHaveAttribute('href', '/feedback')
    expect(screen.getByRole('link', { name: /feedback history/i })).toHaveAttribute('href', '/feedback/history')
    expect(screen.getByRole('link', { name: /feedback history/i })).toHaveAttribute('aria-current', 'page')

    const user = (await import('@testing-library/user-event')).default.setup()
    await user.click(screen.getByRole('button', { name: /log out/i }))
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('uses pathname match for active state and eyebrow label', () => {
    usePathname.mockReturnValue('/profile')

    render(<BragIdentitySidebar activePage="settings" eyebrow="Clausule · Settings" profile={{ email: 'ada@example.com' }} />)

    expect(screen.getByText('Clausule · Personal details')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /personal details/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /security/i })).not.toHaveAttribute('aria-current')
  })

  it('falls back to auth email when profile names are absent', () => {
    render(<BragIdentitySidebar activePage="settings" eyebrow="Clausule · Settings" profile={{ email: 'ada@example.com' }} />)

    expect(screen.getByText('Clausule · Security')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('ada')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('prefers hydrated store identity when shell props are empty', () => {
    useProfileStore.getState().setUser({ id: 'user-1', email: 'ada@example.com', role: 'employee' })
    useProfileStore.getState().setProfile({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' })

    render(<BragIdentitySidebar activePage="settings" eyebrow="Clausule · Settings" profile={{}} />)

    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('renders store identity when hydrated names arrive in server field shape', () => {
    useProfileStore.getState().setUser({ id: 'user-1', email: 'ada@example.com', role: 'employee' })
    useProfileStore.getState().setProfile({ first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com' })

    render(<BragIdentitySidebar activePage="settings" eyebrow="Clausule · Settings" profile={{}} />)

    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })
})
