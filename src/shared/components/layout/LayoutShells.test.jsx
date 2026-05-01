import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuthorShell from './AuthorShell'
import LoginShell from './LoginShell'
import MfaShell from './MfaShell'
import PublicShell from './PublicShell'
import SignupShell from './SignupShell'

vi.mock('@shared/components/ui/SignInBrandPanel', () => ({
  default: ({ children, headline }) => <div>{headline}<div>{children}</div></div>,
}))

vi.mock('@shared/components/BragIdentitySidebar', () => ({
  default: ({ activePage, activeChildPage, eyebrow, profile }) => <div>{activePage}:{activeChildPage ?? ''}:{eyebrow}:{profile?.email ?? ''}</div>,
}))

vi.mock('@shared/components/SignupPanelSummary', () => ({
  default: () => <div>Signup summary</div>,
}))

vi.mock('@shared/components/SignupPlanPanelContent', () => ({
  default: () => <div>Signup plan content</div>,
}))

vi.mock('@shared/components/SignupProgress', () => ({
  default: ({ pathname }) => <div>Signup progress:{pathname}</div>,
}))

describe('layout shells', () => {
  it('renders the login shell', () => {
    const { container } = render(<LoginShell><div>Auth content</div></LoginShell>)

    expect(container.firstChild).toHaveClass('su-shell-wrap', 'su-page')
    expect(screen.getByText(/Thoughtful records\./)).toBeInTheDocument()
    expect(screen.getByText('Auth content')).toBeInTheDocument()
  })

  it('renders the signup shell with signup-only panel content', () => {
    render(<SignupShell pathname="/signup/plan"><div>Signup content</div></SignupShell>)

    expect(screen.getByText(/Almost there\./)).toBeInTheDocument()
    expect(screen.getByText('Signup plan content')).toBeInTheDocument()
    expect(screen.getByText(/Signup progress:/)).toBeInTheDocument()
    expect(screen.getByText('Signup content')).toBeInTheDocument()
  })

  it('renders the mfa shell with dedicated copy', () => {
    render(<MfaShell><div>MFA content</div></MfaShell>)

    expect(screen.getByText(/Secure your account\./)).toBeInTheDocument()
    expect(screen.getByText('MFA content')).toBeInTheDocument()
  })

  it('renders the public shell', () => {
    const { container } = render(<PublicShell><div>Public page</div></PublicShell>)

    expect(container.firstChild).toHaveClass('min-h-screen')
    expect(screen.getByText('Public page')).toBeInTheDocument()
  })

  it('renders the author shell using page config', () => {
    render(
      <AuthorShell pathname="/brag/feedback/history">
        <h1 id="feedback-history-title">Feedback history</h1>
        <div>author content</div>
      </AuthorShell>
    )

    expect(screen.getByText('feedback:feedback-history:Clausule · Feedback:')).toBeInTheDocument()
    expect(screen.getByRole('main', { name: 'Feedback history' })).toHaveClass('be-main', 'page-enter', 'bss-screen')
    expect(screen.getByText('author content')).toBeInTheDocument()
  })

  it('passes session profile data into the author shell sidebar', () => {
    render(
      <AuthorShell pathname="/brag/feedback/history" session={{ profile: { email: 'ada@example.com' } }}>
        <h1 id="feedback-history-title">Feedback history</h1>
        <div>author content</div>
      </AuthorShell>
    )

    expect(screen.getByText('feedback:feedback-history:Clausule · Feedback:ada@example.com')).toBeInTheDocument()
  })

  it('renders the fallback author shell for brag settings', () => {
    render(
      <AuthorShell pathname="/brag/settings">
        <h1 id="brag-settings-title">Security settings</h1>
        <div>open</div>
      </AuthorShell>
    )

    expect(screen.getByText('settings::Clausule · Settings:')).toBeInTheDocument()
    expect(screen.getByRole('main', { name: 'Security settings' })).toHaveClass('be-main', 'page-enter', 'bss-screen')
    expect(screen.getByText('open')).toBeInTheDocument()
  })
})
