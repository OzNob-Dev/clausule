import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RegisterLayout from './layout'

vi.mock('@shared/components/layout/SignupShell', () => ({
  default: ({ children, pathname }) => <div data-testid="signup-shell" data-pathname={pathname}>{children}</div>,
}))

describe('register layout', () => {
  it('wraps register pages in the signup shell', () => {
    render(<RegisterLayout><main>Register route</main></RegisterLayout>)

    expect(screen.getByTestId('signup-shell')).toHaveAttribute('data-pathname', '/register')
    expect(screen.getByText('Register route')).toBeInTheDocument()
  })
})
