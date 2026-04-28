import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import Page from './page'

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((value) => {
    throw new Error(`redirect:${value}`)
  }),
}))

let auth = { error: 'Unauthenticated' }

vi.mock('next/navigation', () => ({
  redirect,
}))

vi.mock('@auth/server/serverSession.js', () => ({
  getServerAuth: vi.fn(async () => auth),
}))

vi.mock('@auth/SignInScreen', () => ({
  default: () => <div>Sign in screen</div>,
}))

describe('login page', () => {
  beforeEach(() => {
    auth = { error: 'Unauthenticated' }
    redirect.mockClear()
  })

  it('redirects authenticated users to their home route', async () => {
    auth = { error: null, role: 'employee' }

    await expect(Page()).rejects.toThrow('redirect:/brag')
    expect(redirect).toHaveBeenCalledWith('/brag')
  })

  it('renders the sign-in screen for unauthenticated users', async () => {
    const ui = await Page()
    render(ui)
    expect(screen.getByText('Sign in screen')).toBeInTheDocument()
  })
})
