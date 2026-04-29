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

vi.mock('@signup/SignupDoneScreen', () => ({
  default: ({ email }) => <div>done:{email}</div>,
}))

describe('signup done page', () => {
  it('renders the done screen with the email query', async () => {
    render(await Page({ searchParams: { email: 'ada@example.com' } }))

    expect(screen.getByText('done:ada@example.com')).toBeInTheDocument()
  })
})
