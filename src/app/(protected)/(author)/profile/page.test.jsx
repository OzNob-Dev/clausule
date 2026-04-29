import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('@account/ProfileScreen', () => ({
  default: () => <div>profile screen</div>,
}))

describe('profile page', () => {
  it('renders the profile screen', () => {
    render(<Page />)
    expect(screen.getByText('profile screen')).toBeInTheDocument()
  })
})
