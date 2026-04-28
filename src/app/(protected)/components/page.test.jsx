import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/components',
}))

describe('components page', () => {
  it('renders the component library inside the app shell', () => {
    render(Page())

    expect(screen.getByRole('heading', { name: 'Component library' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /component library/i })).toHaveAttribute('href', '/components')
    expect(screen.getByRole('link', { name: /component library/i })).toHaveAttribute('aria-current', 'page')
  })
})
