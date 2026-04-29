import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NotFound from './not-found'

vi.mock('@landing/NotFoundScreen', () => ({
  default: () => <div>Not found screen</div>,
}))

describe('NotFound', () => {
  it('renders the landing not found screen', () => {
    render(<NotFound />)
    expect(screen.getByText('Not found screen')).toBeInTheDocument()
  })
})
