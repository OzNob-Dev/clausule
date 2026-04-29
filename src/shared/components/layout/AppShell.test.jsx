import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders the skip link, main landmark, and custom rail', () => {
    render(
      <AppShell rail={<nav aria-label="Custom rail"><a href="/custom">Custom rail</a></nav>}>
        <h1>Content</h1>
      </AppShell>
    )

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('heading', { name: 'Content' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Custom rail' })).toHaveAttribute('href', '/custom')
  })
})
