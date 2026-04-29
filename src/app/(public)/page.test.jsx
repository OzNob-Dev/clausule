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

  it('renders ComingSoon when bypass is inactive', async () => {
    render(<Page />)

    await waitFor(() => expect(screen.getByText(/The intelligence layer for your professional interactions/i)).toBeInTheDocument())
  })

  it('redirects bypassed users to the dashboard', async () => {
    localStorage.setItem('clausule_dev_accexx', 'granted')

    render(<Page />)

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'))
  })
})
