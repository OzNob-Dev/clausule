import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MfaSetupLayout from './layout'

vi.mock('@shared/components/layout/MfaShell', () => ({
  default: ({ children }) => <div data-testid="mfa-shell">{children}</div>,
}))

describe('mfa setup layout', () => {
  it('wraps mfa setup pages in the mfa shell', () => {
    render(<MfaSetupLayout><main>MFA setup</main></MfaSetupLayout>)

    expect(screen.getByTestId('mfa-shell')).toBeInTheDocument()
    expect(screen.getByText('MFA setup')).toBeInTheDocument()
  })
})
