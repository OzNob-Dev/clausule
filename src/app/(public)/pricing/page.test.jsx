import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('next/font/google', () => ({
  DM_Serif_Display: () => ({ variable: 'dm-serif' }),
}))

describe('pricing page', () => {
  it('renders pricing copy', () => {
    const { container } = render(<Page />)

    expect(screen.getByRole('heading', { name: /simple route for public, auth, and protected usage/i })).toBeInTheDocument()
    expect(screen.getByText(/Choose Starter/i)).toBeInTheDocument()
    expect(container.querySelector('main')).toHaveClass('dm-serif')
  })
})
