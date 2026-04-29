import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuthLayout from './layout'

vi.mock('@shared/components/ui/AuthBrandPanel', () => ({
  default: () => <div>Auth brand panel</div>,
}))

describe('auth layout', () => {
  it('renders the auth shell and children', () => {
    render(<AuthLayout><div>Auth content</div></AuthLayout>)

    expect(screen.getByText('Auth brand panel')).toBeInTheDocument()
    expect(screen.getByText('Auth content')).toBeInTheDocument()
  })
})
