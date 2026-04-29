import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Loading from './loading'

vi.mock('@shared/components/ui/PageLoader', () => ({
  default: ({ variant }) => <div>loader:{variant}</div>,
}))

describe('mfa setup loading', () => {
  it('renders the MFA loader', () => {
    render(<Loading />)

    expect(screen.getByText('loader:mfa')).toBeInTheDocument()
  })
})
