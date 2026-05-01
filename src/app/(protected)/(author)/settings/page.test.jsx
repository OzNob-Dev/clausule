import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('@account/SecuritySettingsScreen', () => ({
  default: () => <div>Security settings screen</div>,
}))

describe('author settings page', () => {
  it('renders the security settings screen', () => {
    render(<Page />)
    expect(screen.getByText('Security settings screen')).toBeInTheDocument()
  })
})
