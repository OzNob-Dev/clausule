import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('public page', () => {
  it('renders the marketing hero', () => {
    render(<Page />)

    expect(screen.getByRole('heading', { name: /route every visitor through the right experience/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register')
  })
})
