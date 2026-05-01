import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LoginLayout from './layout'

vi.mock('@shared/components/layout/LoginShell', () => ({
  default: ({ children }) => <div data-testid="login-shell">{children}</div>,
}))

describe('LoginLayout', () => {
  it('wraps the login route in the login shell', () => {
    render(<LoginLayout><main>Login route</main></LoginLayout>)

    expect(screen.getByTestId('login-shell')).toBeInTheDocument()
    expect(screen.getByText('Login route')).toBeInTheDocument()
  })
})
