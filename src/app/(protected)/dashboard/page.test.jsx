import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

describe('dashboard page', () => {
  it('renders the dashboard shell content', () => {
    render(Page())

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Open' })).toHaveLength(3)
  })
})
