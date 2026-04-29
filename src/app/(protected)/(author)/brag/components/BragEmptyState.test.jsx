import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BragEmptyState from './BragEmptyState'

describe('BragEmptyState', () => {
  it('renders the mockup prompts and opens the composer from each action', async () => {
    const user = userEvent.setup()
    const onAddEntry = vi.fn()

    render(<BragEmptyState onAddEntry={onAddEntry} />)

    expect(screen.getByRole('heading', { name: /you've done great things/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log a recent win/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /capture feedback you received/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /note a challenge you overcame/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /log a recent win/i }))
    await user.click(screen.getByRole('button', { name: /add your first entry/i }))

    expect(onAddEntry).toHaveBeenCalledTimes(2)
  })
})
