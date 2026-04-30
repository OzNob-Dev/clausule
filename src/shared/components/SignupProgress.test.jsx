import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import SignupProgress from './SignupProgress'

let pathname = '/signup'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

describe('SignupProgress', () => {
  beforeEach(() => {
    pathname = '/signup'
  })

  it('marks the current step from the pathname', () => {
    pathname = '/signup/plan'
    render(<SignupProgress />)

    expect(screen.getByText('Plan')).toHaveAttribute('aria-current', 'step')
  })
})
