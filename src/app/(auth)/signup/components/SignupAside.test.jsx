import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignupAside from './SignupAside'

describe('SignupAside', () => {
  it('shows the plan price and includes', () => {
    render(<SignupAside />)

    expect(screen.getByText('Individual plan')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
    expect(screen.getByText(/Brag doc with evidence rings/i)).toBeInTheDocument()
  })
})
