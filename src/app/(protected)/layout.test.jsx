import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProtectedLayout from './layout'

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((value) => {
    throw new Error(`redirect:${value}`)
  }),
}))

let pathname = '/brag'
let session = {
  user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
  profile: { email: 'ada@example.com' },
  security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
}

vi.mock('next/navigation', () => ({ redirect }))

vi.mock('next/headers', () => ({
  headers: async () => ({ get: (key) => (key === 'x-clausule-pathname' ? pathname : null) }),
}))

vi.mock('@auth/server/serverSession.js', () => ({
  getServerBootstrapSession: vi.fn(async () => session),
}))

vi.mock('@auth/context/AuthContext', () => ({
  AuthProvider: ({ children, initialSession }) => <div data-testid="auth-provider" data-user={initialSession?.user?.email ?? ''}>{children}</div>,
}))

vi.mock('@shared/components/layout/DevAccessGate', () => ({
  default: ({ children }) => <div data-testid="dev-gate">{children}</div>,
}))

vi.mock('@shared/components/layout/AppShell', () => ({
  AppShell: ({ children }) => <div data-testid="protected-shell">{children}</div>,
}))

describe('protected layout', () => {
  beforeEach(() => {
    pathname = '/brag'
    session = {
      user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
      profile: { email: 'ada@example.com' },
      security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
    }
    redirect.mockClear()
  })

  it('wraps protected pages in auth provider, dev gate, and protected shell', async () => {
    render(await ProtectedLayout({ children: <main>Protected page</main> }))

    expect(screen.getByTestId('auth-provider')).toHaveAttribute('data-user', 'ada@example.com')
    expect(screen.getByTestId('dev-gate')).toBeInTheDocument()
    expect(screen.getByTestId('protected-shell')).toBeInTheDocument()
    expect(screen.getByText('Protected page')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to login', async () => {
    session = null

    await expect(ProtectedLayout({ children: <main>Blocked</main> })).rejects.toThrow('redirect:/login')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('redirects non-exempt routes to settings until MFA is configured', async () => {
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false },
    }

    await expect(ProtectedLayout({ children: <main>Blocked</main> })).rejects.toThrow('redirect:/settings')
    expect(redirect).toHaveBeenCalledWith('/settings')
  })

  it('allows MFA-exempt routes while setup is incomplete', async () => {
    pathname = '/brag/settings'
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false },
    }

    render(await ProtectedLayout({ children: <main>Settings</main> }))

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redirects employee manager-route access to brag', async () => {
    pathname = '/dashboard'

    await expect(ProtectedLayout({ children: <main>Dashboard</main> })).rejects.toThrow('redirect:/brag')
    expect(redirect).toHaveBeenCalledWith('/brag')
  })

  it('allows manager access to manager routes', async () => {
    pathname = '/dashboard'
    session = {
      ...session,
      user: { id: 'mgr-1', email: 'mgr@example.com', role: 'manager' },
    }

    render(await ProtectedLayout({ children: <main>Dashboard</main> }))

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})
