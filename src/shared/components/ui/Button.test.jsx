import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders button variants and calls handlers', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button variant="ghost" size="sm" onClick={onClick}>Save</Button>)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders links when requested', () => {
    render(<Button as="a" href="/components">Library</Button>)

    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/components')
  })
})
