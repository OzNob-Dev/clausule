import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RailNav } from './RailNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
}))

describe('RailNav', () => {
  it('links to the profile page', () => {
    render(<RailNav />)

    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile')
  })
})
