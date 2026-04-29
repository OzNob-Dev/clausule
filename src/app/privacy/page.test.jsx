import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('privacy page', () => {
  it('renders the privacy policy copy', () => {
    render(<Page />)

    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to register/i })).toHaveAttribute('href', '/register')
  })
})
