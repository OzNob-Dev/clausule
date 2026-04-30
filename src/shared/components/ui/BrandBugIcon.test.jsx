import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandMarkIcon } from '@shared/components/ui/icon/BrandMarkIcon'

describe('BrandMarkIcon', () => {
  it('renders at the requested size', () => {
    const { container } = render(<BrandMarkIcon size={18} />)

    expect(container.querySelector('svg')).toHaveAttribute('width', '18')
    expect(container.querySelector('svg')).toHaveAttribute('height', '18')
  })
})
