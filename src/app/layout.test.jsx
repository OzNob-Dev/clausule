import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RootLayout, { metadata } from './layout'

vi.mock('@shared/providers/QueryProvider', () => ({
  QueryProvider: ({ children }) => <div data-testid="query-provider">{children}</div>,
}))

describe('RootLayout', () => {
  it('renders the document shell, query provider, and children', async () => {
    const { container } = render(await RootLayout({ children: <main>Home</main> }))

    expect(container.querySelector('html')).toHaveAttribute('lang', 'en')
    expect(screen.getByTestId('query-provider')).toBeInTheDocument()
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
