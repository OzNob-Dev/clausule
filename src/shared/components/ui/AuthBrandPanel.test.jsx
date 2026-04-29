import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthBrandPanel from './AuthBrandPanel'

let pathname = '/'
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}))

describe('AuthBrandPanel', () => {
  beforeEach(() => {
    pathname = '/'
    searchParams = new URLSearchParams()
  })

  it('renders the default brand copy on the landing route', () => {
    render(<AuthBrandPanel brandHref="/" />)

    expect(screen.getByText('Thoughtful records.')).toBeInTheDocument()
    expect(screen.getByText('Better conversations.')).toBeInTheDocument()
  })

  it('renders signup panel content and progress on the signup route', () => {
    pathname = '/signup'

    render(<AuthBrandPanel brandHref="/" />)

    expect(screen.getByText('Build your record.')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Signup progress' })).toBeInTheDocument()
  })

  it('renders the plan panel content on the plan route', () => {
    pathname = '/signup/plan'
    searchParams = new URLSearchParams('email=ada@example.com')

    render(<AuthBrandPanel brandHref="/" />)

    expect(screen.getByText('What happens next')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })
})
