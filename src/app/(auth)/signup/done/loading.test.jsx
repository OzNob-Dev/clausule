import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Loading from './loading'

vi.mock('@shared/components/ui/PageLoader', () => ({
  default: ({ variant }) => <div>loader:{variant}</div>,
}))

describe('signup done loading', () => {
  it('renders the shared loader', () => {
    render(<Loading />)
    expect(screen.getByText('loader:signup')).toBeInTheDocument()
  })
})
