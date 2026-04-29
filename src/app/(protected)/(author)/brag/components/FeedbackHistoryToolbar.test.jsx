import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FeedbackHistoryToolbar from './FeedbackHistoryToolbar'

describe('FeedbackHistoryToolbar', () => {
  it('renders filters and calls back when a filter changes', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()

    render(<FeedbackHistoryToolbar activeFilter="all" count={4} onFilterChange={onFilterChange} />)

    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('4')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /replied/i }))

    expect(onFilterChange).toHaveBeenCalledWith('replied')
  })
})
