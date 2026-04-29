import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import Layout from './layout'

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect }))
vi.mock('@auth/server/serverSession.js', () => ({ getServerBootstrapSession: vi.fn() }))
vi.mock('@auth/context/AuthContext', () => ({ AuthProvider: ({ children }) => <>{children}</> }))

describe('mfa exempt layout', () => {
  beforeEach(() => redirect.mockClear())

  it('redirects unauthenticated users to login', async () => {
    const { getServerBootstrapSession } = await import('@auth/server/serverSession.js')
    getServerBootstrapSession.mockResolvedValue(null)

    await Layout({ children: <div>blocked</div> })
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('renders children for authenticated users', async () => {
    const { getServerBootstrapSession } = await import('@auth/server/serverSession.js')
    getServerBootstrapSession.mockResolvedValue({ user: { id: 'user-1' } })

    render(await Layout({ children: <div>open</div> }))
    expect(screen.getByText('open')).toBeInTheDocument()
  })
})
