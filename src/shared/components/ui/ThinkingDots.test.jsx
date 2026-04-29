import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThinkingDots } from './ThinkingDots'

describe('ThinkingDots', () => {
  it('renders three decorative dots', () => {
    const { container } = render(<ThinkingDots />)

    expect(container.querySelectorAll('span > span')).toHaveLength(3)
  })
})
