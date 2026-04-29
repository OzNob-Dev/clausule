import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((value) => {
    throw new Error(`redirect:${value}`)
  }),
}))

vi.mock('next/navigation', () => ({
  redirect,
}))

vi.mock('@auth/server/serverSession.js', () => ({
  getServerAuth: vi.fn(async () => ({ error: 'Unauthenticated' })),
}))

vi.mock('@signup/SignupPlanScreen', () => ({
  default: ({ accountData }) => <div>plan:{accountData.email}</div>,
}))

describe('signup plan page', () => {
  it('renders the plan screen with the account data', async () => {
    render(await Page({ searchParams: { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' } }))

    expect(screen.getByText('plan:ada@example.com')).toBeInTheDocument()
  })
})
