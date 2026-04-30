import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Loading from './loading'

describe('protected loading', () => {
  it('renders the neutral app loader inside the app shell', () => {
    render(<Loading />)

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('status', { name: 'Loading app' })).toBeInTheDocument()
  })
})
