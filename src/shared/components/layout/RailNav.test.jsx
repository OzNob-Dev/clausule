import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RailNav } from './RailNav'

let pathname = '/profile'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

describe('RailNav', () => {
  it('links to the profile page', () => {
    pathname = '/profile'
    render(<RailNav />)

    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile')
  })

  it('links to the components library and marks it active', () => {
    pathname = '/components'
    render(<RailNav />)

    expect(screen.getByRole('link', { name: /component library/i })).toHaveAttribute('href', '/components')
    expect(screen.getByRole('link', { name: /component library/i })).toHaveAttribute('aria-current', 'page')
  })
})
