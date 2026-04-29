import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('terms page', () => {
  it('renders the terms copy', () => {
    render(<Page />)

    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to register/i })).toHaveAttribute('href', '/register')
  })
})
