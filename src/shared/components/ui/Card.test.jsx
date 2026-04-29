import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders semantic containers with tone and padding classes', () => {
    const { container } = render(<Card as="section" tone="elevated" padding="lg">Card title</Card>)

    expect(container.firstElementChild).toHaveAttribute('class', expect.stringContaining('rounded-[1.75rem]'))
    expect(container.firstElementChild).toHaveAttribute('class', expect.stringContaining('p-6'))
    expect(screen.getByText('Card title')).toBeInTheDocument()
  })
})
