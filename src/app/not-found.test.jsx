import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NotFound from './not-found'

const back = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back }),
}))

describe('NotFound', () => {
  it('renders the 404 content', () => {
    render(<NotFound />)
    expect(screen.getByText(/This entry doesn't exist/i)).toBeInTheDocument()
  })
})
