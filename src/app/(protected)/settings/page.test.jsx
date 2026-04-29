import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('@brag/BragSettingsScreen', () => ({
  default: () => <div>settings screen</div>,
}))

describe('settings page', () => {
  it('renders the settings screen', () => {
    render(<Page />)
    expect(screen.getByText('settings screen')).toBeInTheDocument()
  })
})
