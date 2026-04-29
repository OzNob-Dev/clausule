import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import NotFoundScreen from './NotFoundScreen'

const back = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back }),
}))

describe('NotFoundScreen', () => {
  it('renders the error copy and go-back action', async () => {
    const user = userEvent.setup()

    render(<NotFoundScreen />)

    expect(screen.getByText(/This entry doesn't exist/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /go back/i }))
    expect(back).toHaveBeenCalledTimes(1)
  })
})
