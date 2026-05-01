import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BragIdentitySidebar from './BragIdentitySidebar'

const logout = vi.fn()

vi.mock('@shared/components/ClientSignOutButton', () => ({
  default: () => <button type="button" onClick={logout}>Log out</button>,
}))

describe('BragIdentitySidebar integration', () => {
  beforeEach(() => {
    logout.mockClear()
  })

  it('renders the same sidebar routes as the standalone shell', () => {
    render(<BragIdentitySidebar activePage="brag" activeChildPage="resume" profile={{ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }} />)

    expect(screen.getByRole('link', { name: /personal details/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute('href', '/brag/resume')
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', '/brag/linkedin')
    expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute('aria-current', 'page')
  })

  it('delegates sign out to auth context', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()

    render(<BragIdentitySidebar activePage="brag" />)
    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
