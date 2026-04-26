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
  profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', mobile: '', jobTitle: '', department: '' },
  security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
}

vi.mock('next/navigation', () => ({
  redirect,
}))

vi.mock('next/headers', () => ({
  headers: async () => ({ get: (key) => (key === 'x-clausule-pathname' ? pathname : null) }),
}))

vi.mock('@features/auth/context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
}))

vi.mock('@features/auth/server/serverSession.js', () => ({
  getServerBootstrapSession: vi.fn(async () => session),
}))

describe('ProtectedLayout MFA lock', () => {
  beforeEach(() => {
    pathname = '/brag'
    session = {
      user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
      profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', mobile: '', jobTitle: '', department: '' },
      security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
    }
    redirect.mockClear()
  })

  it('redirects unauthenticated users to sign in', async () => {
    session = null

    await expect(ProtectedLayout({ children: <div>Blocked app</div> })).rejects.toThrow('redirect:/')
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('redirects protected routes to brag settings until MFA is configured', async () => {
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false },
    }

    await expect(ProtectedLayout({ children: <div>Blocked app</div> })).rejects.toThrow('redirect:/brag/settings')
    expect(redirect).toHaveBeenCalledWith('/brag/settings')
  })

  it('allows brag settings while MFA setup is incomplete', async () => {
    pathname = '/brag/settings'
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: false },
    }

    render(await ProtectedLayout({ children: <div>Security settings</div> }))

    expect(screen.getByText('Security settings')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('allows app access after MFA is configured', async () => {
    render(await ProtectedLayout({ children: <div>Unlocked app</div> }))

    expect(screen.getByText('Unlocked app')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('allows app access when SSO is configured without MFA', async () => {
    session = {
      ...session,
      security: { authenticatorAppConfigured: false, authenticatedWithOtp: true, ssoConfigured: true },
    }

    render(await ProtectedLayout({ children: <div>SSO enabled app</div> }))

    expect(screen.getByText('SSO enabled app')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('ProtectedLayout role guard', () => {
  beforeEach(() => {
    redirect.mockClear()
  })

  it('redirects an employee deep-linking to /dashboard to /brag', async () => {
    pathname = '/dashboard'
    session = {
      user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
      profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', mobile: '', jobTitle: '', department: '' },
      security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
    }

    await expect(ProtectedLayout({ children: <div>Manager dashboard</div> })).rejects.toThrow('redirect:/brag')
    expect(redirect).toHaveBeenCalledWith('/brag')
  })

  it('redirects an employee deep-linking to /entries to /brag', async () => {
    pathname = '/entries'
    session = {
      user: { id: 'user-1', email: 'ada@example.com', role: 'employee' },
      profile: { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', mobile: '', jobTitle: '', department: '' },
      security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
    }

    await expect(ProtectedLayout({ children: <div>Manager entries</div> })).rejects.toThrow('redirect:/brag')
    expect(redirect).toHaveBeenCalledWith('/brag')
  })

  it('allows a manager to access /dashboard', async () => {
    pathname = '/dashboard'
    session = {
      user: { id: 'user-2', email: 'mgr@example.com', role: 'manager' },
      profile: { firstName: 'Max', lastName: 'Mgr', email: 'mgr@example.com', mobile: '', jobTitle: '', department: '' },
      security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
    }

    render(await ProtectedLayout({ children: <div>Manager dashboard</div> }))

    expect(screen.getByText('Manager dashboard')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('allows a manager to access /entries', async () => {
    pathname = '/entries'
    session = {
      user: { id: 'user-2', email: 'mgr@example.com', role: 'manager' },
      profile: { firstName: 'Max', lastName: 'Mgr', email: 'mgr@example.com', mobile: '', jobTitle: '', department: '' },
      security: { authenticatorAppConfigured: true, authenticatedWithOtp: true, ssoConfigured: false },
    }

    render(await ProtectedLayout({ children: <div>Manager entries</div> }))

    expect(screen.getByText('Manager entries')).toBeInTheDocument()
    expect(redirect).not.toHaveBeenCalled()
  })
})
