import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import BragDocToolbar from './BragDocToolbar'

describe('BragDocToolbar', () => {
  it('renders add action, year tabs, and entry count', async () => {
    const user = userEvent.setup()
    const onAddEntry = vi.fn()
    const onYearSelect = vi.fn()

    render(
      <BragDocToolbar
        activeYear={2025}
        entryCount={1}
        years={[2026, 2025, 2024]}
        onAddEntry={onAddEntry}
        onYearSelect={onYearSelect}
      />
    )

    expect(screen.getByRole('button', { name: /add a win/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2025' })).toHaveClass('be-doc-year-tab--active')
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2024' })).toHaveAttribute('aria-controls', 'be-doc-year-2024')
    expect(screen.getByLabelText('Entry count')).toHaveTextContent('1entry')

    await user.click(screen.getByRole('button', { name: /add a win/i }))
    await user.click(screen.getByRole('button', { name: '2024' }))
    expect(onAddEntry).toHaveBeenCalledTimes(1)
    expect(onYearSelect).toHaveBeenCalledWith(2024)
  })
})
