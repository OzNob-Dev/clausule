import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('@mfa/MfaSetupScreen', () => ({
  default: () => <div>MFA setup screen</div>,
}))

describe('mfa setup page', () => {
  it('renders the MFA setup screen', () => {
    render(<Page />)

    expect(screen.getByText('MFA setup screen')).toBeInTheDocument()
  })
})
