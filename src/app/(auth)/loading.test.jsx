import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Loading from './loading'

vi.mock('@shared/components/ui/PageLoader', () => ({
  default: ({ variant }) => <div>loader:{variant}</div>,
}))

describe('auth loading', () => {
  it('renders the auth page loader', () => {
    render(<Loading />)

    expect(screen.getByText('loader:auth')).toBeInTheDocument()
  })
})
