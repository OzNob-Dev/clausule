import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ProtectedLayout from './layout'

vi.mock('@shared/components/layout/AppShell', () => ({
  AppShell: ({ children }) => <div data-testid="protected-shell">{children}</div>,
}))

describe('protected layout', () => {
  it('wraps protected pages in the shared protected shell', () => {
    render(<ProtectedLayout><main>Protected page</main></ProtectedLayout>)

    expect(screen.getByTestId('protected-shell')).toBeInTheDocument()
    expect(screen.getByText('Protected page')).toBeInTheDocument()
  })
})
