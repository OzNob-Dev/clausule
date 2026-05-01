import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Page from './page'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('public page', () => {
  beforeEach(() => {
    replace.mockClear()
    localStorage.removeItem('clausule_dev_accexx')
    window.history.pushState({}, '', '/')
  })

  it('renders ComingSoon content as a plain page', () => {
    render(<Page />)

    expect(screen.getByText(/The intelligence layer for your professional interactions/i)).toBeInTheDocument()
  })

  it('grants access from the bypaxxx query param and redirects to login', async () => {
    window.history.pushState({}, '', '/?bypaxxx=true')

    render(<Page />)

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'))
    expect(localStorage.getItem('clausule_dev_accexx')).toBe('true')
  })
})
