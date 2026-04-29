import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GlobalError from './global-error'

describe('GlobalError', () => {
  it('renders a retry button', async () => {
    const user = userEvent.setup()
    const reset = vi.fn()

    render(<GlobalError error={new Error('boom')} reset={reset} />)
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(reset).toHaveBeenCalledTimes(1)
  })
})
