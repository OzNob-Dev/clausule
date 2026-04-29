import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RootLayout from './layout'

vi.mock('@shared/providers/QueryProvider', () => ({
  QueryProvider: ({ children }) => <>{children}</>,
}))

describe('RootLayout', () => {
  it('renders the document shell and children', () => {
    const { container } = render(<RootLayout><main>Home</main></RootLayout>)

    expect(container.querySelector('html')).toHaveAttribute('lang', 'en')
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
