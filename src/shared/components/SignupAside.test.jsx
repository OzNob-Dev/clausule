import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SignupAside from './SignupAside'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
}))

describe('SignupAside', () => {
  it('shows the plan price and includes', () => {
    render(<SignupAside />)

    expect(screen.getByText('Individual plan')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
    expect(screen.getByText(/Brag doc with evidence rings/i)).toBeInTheDocument()
  })
})
