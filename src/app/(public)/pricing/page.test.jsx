import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('pricing page', () => {
  it('renders pricing copy', () => {
    render(<Page />)

    expect(screen.getByRole('heading', { name: /simple route for public, auth, and protected usage/i })).toBeInTheDocument()
    expect(screen.getByText(/Choose Starter/i)).toBeInTheDocument()
  })
})
