import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RouteShell from './RouteShell'

let pathname = '/'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

vi.mock('@shared/components/ui/AuthBrandPanel', () => ({
  default: () => <div>Auth brand panel</div>,
}))

vi.mock('@shared/components/BragIdentitySidebar', () => ({
  default: ({ activePage, activeChildPage, eyebrow }) => <div>{activePage}:{activeChildPage ?? ''}:{eyebrow}</div>,
}))

describe('RouteShell', () => {
  beforeEach(() => {
    pathname = '/'
  })

  it('renders the auth shell for auth routes', () => {
    pathname = '/signup'

    render(<RouteShell><div>Auth content</div></RouteShell>)

    expect(screen.getByText('Auth brand panel')).toBeInTheDocument()
    expect(screen.getByText('Auth content')).toBeInTheDocument()
  })

  it('renders the public shell for public marketing routes', () => {
    pathname = '/pricing'

    const { container } = render(<RouteShell><div>Public page</div></RouteShell>)

    expect(container.firstChild).toHaveClass('min-h-screen')
    expect(screen.getByText('Public page')).toBeInTheDocument()
  })

  it('renders the author shell using page config', () => {
    pathname = '/brag/feedback/history'

    render(
      <RouteShell>
        <h1 id="feedback-history-title">Feedback history</h1>
        <div>author content</div>
      </RouteShell>
    )

    expect(screen.getByText('feedback:feedback-history:Clausule · Feedback')).toBeInTheDocument()
    expect(screen.getByRole('main', { name: 'Feedback history' })).toHaveClass('be-main', 'page-enter', 'bss-screen')
    expect(screen.getByText('author content')).toBeInTheDocument()
  })

  it('renders the settings author shell for brag settings', () => {
    pathname = '/brag/settings'

    render(
      <RouteShell>
        <h1 id="brag-settings-title">Security settings</h1>
        <div>open</div>
      </RouteShell>
    )

    expect(screen.getByText('settings::Clausule · Settings')).toBeInTheDocument()
    expect(screen.getByRole('main', { name: 'Security settings' })).toHaveClass('be-main', 'page-enter', 'bss-screen')
    expect(screen.getByText('open')).toBeInTheDocument()
  })
})
