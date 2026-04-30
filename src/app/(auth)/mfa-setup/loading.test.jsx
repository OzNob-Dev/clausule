import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Loading from './loading'

describe('mfa setup loading', () => {
  it('renders the shared loading overlay', () => {
    render(<Loading />)

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })
})
