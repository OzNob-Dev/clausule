import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CategoryDot, CategoryPill } from './CategoryPill'

describe('CategoryPill', () => {
  it('renders the label and dot for a category', () => {
    render(<CategoryPill cat="conduct" showDot />)

    expect(screen.getByText('Conduct')).toBeInTheDocument()
  })

  it('renders a clickable category dot', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<CategoryDot cat="dev" onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'Filter by Development' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
