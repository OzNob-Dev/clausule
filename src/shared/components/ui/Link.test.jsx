import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Link } from './Link'

describe('Link', () => {
  it('renders internal and external links with the right element', () => {
    render(
      <>
        <Link href="/components">Internal</Link>
        <Link href="https://example.com">External</Link>
      </>
    )

    expect(screen.getByRole('link', { name: 'Internal' })).toHaveAttribute('href', '/components')
    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('href', 'https://example.com')
  })
})
