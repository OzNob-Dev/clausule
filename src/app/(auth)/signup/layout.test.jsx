import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignupLayout from './layout'

let pathname = '/signup'

vi.mock('next/headers', () => ({
  headers: async () => ({ get: (key) => (key === 'x-clausule-pathname' ? pathname : null) }),
}))

vi.mock('@shared/components/layout/SignupShell', () => ({
  default: ({ children, pathname: currentPathname }) => <div data-testid="signup-shell" data-pathname={currentPathname}>{children}</div>,
}))

describe('signup layout', () => {
  beforeEach(() => {
    pathname = '/signup'
  })

  it('wraps signup pages in the signup shell using the request pathname', async () => {
    pathname = '/signup/plan'

    render(await SignupLayout({ children: <main>Signup plan</main> }))

    expect(screen.getByTestId('signup-shell')).toHaveAttribute('data-pathname', '/signup/plan')
    expect(screen.getByText('Signup plan')).toBeInTheDocument()
  })
})
