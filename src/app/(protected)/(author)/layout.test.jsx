import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthorLayout from './layout'

let pathname = '/profile'
let session = { profile: { email: 'ada@example.com' } }

vi.mock('next/headers', () => ({
  headers: async () => ({ get: (key) => (key === 'x-clausule-pathname' ? pathname : null) }),
}))

vi.mock('@auth/server/serverSession.js', () => ({
  getServerBootstrapSession: vi.fn(async () => session),
}))

vi.mock('@shared/components/layout/AuthorShell', () => ({
  default: ({ children, pathname: currentPathname, session: currentSession }) => (
    <div data-testid="author-shell" data-pathname={currentPathname} data-session-email={currentSession?.profile?.email ?? ''}>
      {children}
    </div>
  ),
}))

describe('author layout', () => {
  beforeEach(() => {
    pathname = '/profile'
    session = { profile: { email: 'ada@example.com' } }
  })

  it('wraps author pages in the author shell using pathname and bootstrap session', async () => {
    pathname = '/brag/feedback/history'

    render(await AuthorLayout({ children: <main>Author page</main> }))

    expect(screen.getByTestId('author-shell')).toHaveAttribute('data-pathname', '/brag/feedback/history')
    expect(screen.getByTestId('author-shell')).toHaveAttribute('data-session-email', 'ada@example.com')
    expect(screen.getByText('Author page')).toBeInTheDocument()
  })
})
