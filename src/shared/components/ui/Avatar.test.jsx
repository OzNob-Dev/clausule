import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders initials with custom colors and size', () => {
    const { container } = render(<Avatar initials="AL" bg="#111" color="#fff" size="lg" />)

    const avatar = screen.getByText('AL')
    expect(avatar).toHaveClass('h-12', 'w-12', 'text-sm')
    expect(container.firstElementChild).toHaveAttribute('style', '--avatar-bg: #111; --avatar-fg: #fff;')
  })
})
