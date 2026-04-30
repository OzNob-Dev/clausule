import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Loading from './loading'

vi.mock('next/navigation', () => ({
  usePathname: () => '/brag',
}))

vi.mock('@shared/components/BragIdentitySidebar', () => ({
  default: ({ ariaLabel }) => <aside aria-label={ariaLabel}>Sidebar</aside>,
}))

describe('author loading', () => {
  it('keeps the sidebar chrome visible and loads the main content area', () => {
    render(<Loading />)

    expect(screen.getByRole('complementary', { name: 'Sidebar navigation' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading app' })).toBeInTheDocument()
  })
})
