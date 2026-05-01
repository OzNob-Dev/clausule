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
  default: ({ children }) => <>{children}</>,
}))

vi.mock('@shared/components/layout/RouteShell', () => ({
  default: ({ children, initialPathname }) => <div data-pathname={initialPathname}>{children}</div>,
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
    expect(screen.getByText('Home').parentElement).toHaveAttribute('data-pathname', '/')
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

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
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

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByText('Manager dashboard')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})
