import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RootLayout from './layout'

vi.mock('next/font/google', () => ({
  DM_Sans: () => ({ variable: 'dm-sans' }),
}))

vi.mock('@shared/providers/QueryProvider', () => ({
  QueryProvider: ({ children }) => <>{children}</>,
}))

describe('RootLayout', () => {
  it('renders the document shell and children', () => {
    const { container } = render(<RootLayout><main>Home</main></RootLayout>)

    expect(container.querySelector('html')).toHaveAttribute('lang', 'en')
    expect(container.querySelector('html')).toHaveClass('dm-sans')
    expect(container.querySelector('html')).not.toHaveClass('dm-serif')
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
