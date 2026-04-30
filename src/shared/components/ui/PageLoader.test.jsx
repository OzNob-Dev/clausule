import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageLoader from './PageLoader'

describe('PageLoader', () => {
  it.each([
    ['app', 'Loading app'],
    ['signup', 'Signing up'],
    ['auth', 'Signing in'],
    ['brag', 'Loading doc'],
    ['feedback', 'Sending'],
    ['settings', 'Saving'],
    ['profile', 'Loading profile'],
    ['mfa', 'Loading secure setup'],
  ])('renders %s with label %s', (variant, label) => {
    render(<PageLoader variant={variant} />)

    expect(screen.getByRole('status', { name: label })).toBeInTheDocument()
  })

  it('falls back to brag for unknown variants', () => {
    render(<PageLoader variant="unknown" />)

    expect(screen.getByRole('status', { name: 'Loading doc' })).toBeInTheDocument()
  })
})
