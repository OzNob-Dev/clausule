import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RootLayout, { metadata } from './layout'

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((value) => {
    throw new Error(`redirect:${value}`)
  }),
}))

let pathname = '/'
let session = {
  user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
  profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', mobile: '', jobTitle: '', department: '' },
  security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
}

vi.mock('next/navigation', () => ({ redirect }))

vi.mock('next/headers', () => ({
  headers: async () => ({ get: (key) => (key === 'x-clausule-pathname' ? pathname : null) }),
}))

vi.mock('@auth/context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}))

vi.mock('@auth/server/serverSession.js', () => ({
  getServerBootstrapSession: vi.fn(async () => session),
}))

vi.mock('@shared/providers/QueryProvider', () => ({
  QueryProvider: ({ children }) => <>{children}</>,
}))

vi.mock('@shared/components/layout/DevAccessGate', () => ({
  default: ({ children }) => <div data-testid="dev-gate">{children}</div>,
}))

vi.mock('@shared/components/layout/LoginShell', () => ({
  default: ({ children }) => <div data-testid="login-shell">{children}</div>,
}))

vi.mock('@shared/components/layout/MfaShell', () => ({
  default: ({ children }) => <div data-testid="mfa-shell">{children}</div>,
}))

vi.mock('@shared/components/layout/AuthorShell', () => ({
  default: ({ children, pathname: currentPathname, session: currentSession }) => <div data-testid="author-shell" data-pathname={currentPathname} data-session-email={currentSession?.profile?.email ?? ''}>{children}</div>,
}))

vi.mock('@shared/components/layout/PublicShell', () => ({
  default: ({ children }) => <div data-testid="public-shell">{children}</div>,
}))

describe('RootLayout', () => {
  beforeEach(() => {
    pathname = '/'
    session = {
      user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
      profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', mobile: '', jobTitle: '', department: '' },
      security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
    }
    redirect.mockClear()
  })

  it('renders the document shell and children', async () => {
    const { container } = render(await RootLayout({ children: <main>Home</main> }))

    expect(container.querySelector('html')).toHaveAttribute('lang', 'en')
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByTestId('public-shell')).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
  })

  it('leaves public routes outside the gated client providers', async () => {
    pathname = '/pricing'
    session = null

    render(await RootLayout({ children: <main>Pricing</main> }))

    expect(screen.getByTestId('public-shell')).toBeInTheDocument()
    expect(screen.queryByTestId('dev-gate')).not.toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('leaves login shell selection to the login route subtree while keeping auth providers', async () => {
    pathname = '/login'
    session = null

    render(await RootLayout({ children: <main>Login</main> }))

    expect(screen.getByTestId('dev-gate')).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.queryByTestId('login-shell')).not.toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('wraps signup routes in the signup shell', async () => {
    pathname = '/signup/plan'
    session = null

    render(await RootLayout({ children: <main>Signup</main> }))

    expect(screen.getByTestId('dev-gate')).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.queryByTestId('login-shell')).not.toBeInTheDocument()
    expect(screen.queryByTestId('public-shell')).not.toBeInTheDocument()
    expect(screen.getByText('Signup')).toBeInTheDocument()
  })

  it('leaves mfa setup shell selection to the route subtree', async () => {
    pathname = '/mfa-setup'
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false },
    }

    render(await RootLayout({ children: <main>MFA setup</main> }))

    expect(screen.getByTestId('dev-gate')).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.queryByTestId('login-shell')).not.toBeInTheDocument()
    expect(screen.getByText('MFA setup')).toBeInTheDocument()
  })

  it('keeps the favicon metadata pointed at the public svg mirror', () => {
    expect(metadata.icons.icon).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/favicon.svg', type: 'image/svg+xml' }),
      ])
    )
  })

  it('redirects unauthenticated protected users to login', async () => {
    pathname = '/brag'
    session = null

    await expect(RootLayout({ children: <div>Blocked app</div> })).rejects.toThrow('redirect:/login')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('redirects protected routes to settings until MFA is configured', async () => {
    pathname = '/brag'
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false },
    }

    await expect(RootLayout({ children: <div>Blocked app</div> })).rejects.toThrow('redirect:/settings')
    expect(redirect).toHaveBeenCalledWith('/settings')
  })

  it('allows MFA-exempt protected routes while MFA setup is incomplete', async () => {
    pathname = '/brag/settings'
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false },
    }

    render(await RootLayout({ children: <div>Security settings</div> }))

    expect(screen.getByTestId('dev-gate')).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('author-shell')).toHaveAttribute('data-pathname', '/brag/settings')
    expect(screen.getByTestId('author-shell')).toHaveAttribute('data-session-email', 'ada@example.com')
    expect(screen.getByText('Security settings')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redirects employee manager-route access to brag', async () => {
    pathname = '/dashboard'

    await expect(RootLayout({ children: <div>Manager dashboard</div> })).rejects.toThrow('redirect:/brag')
    expect(redirect).toHaveBeenCalledWith('/brag')
  })

  it('allows manager access to manager routes', async () => {
    pathname = '/dashboard'
    session = {
      ...session,
      user: { id: 'user-2', email: 'mgr@example.com', role: 'manager' },
    }

    render(await RootLayout({ children: <div>Manager dashboard</div> }))

    expect(screen.getByTestId('dev-gate')).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByText('Manager dashboard')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})
