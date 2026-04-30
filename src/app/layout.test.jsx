import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RootLayout, { metadata } from './layout'

vi.mock('@shared/providers/QueryProvider', () => ({
  QueryProvider: ({ children }) => <>{children}</>,
}))

vi.mock('@shared/components/layout/DevAccessGate', () => ({
  default: ({ children }) => <>{children}</>,
}))

describe('RootLayout', () => {
  it('renders the document shell and children', () => {
    const { container } = render(<RootLayout><main>Home</main></RootLayout>)

    expect(container.querySelector('html')).toHaveAttribute('lang', 'en')
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('keeps the favicon metadata pointed at the public svg mirror', () => {
    expect(metadata.icons.icon).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/favicon.svg', type: 'image/svg+xml' }),
      ])
    )
  })
})
