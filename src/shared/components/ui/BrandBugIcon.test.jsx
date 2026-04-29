import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandBugIcon } from './BrandBugIcon'

describe('BrandBugIcon', () => {
  it('renders at the requested size', () => {
    const { container } = render(<BrandBugIcon size={18} />)

    expect(container.querySelector('svg')).toHaveAttribute('width', '18')
    expect(container.querySelector('svg')).toHaveAttribute('height', '18')
  })
})
