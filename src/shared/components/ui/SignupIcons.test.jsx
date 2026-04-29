import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArrowIcon, BackIcon, CheckIcon } from './SignupIcons'

describe('SignupIcons', () => {
  it('renders the svg icons', () => {
    const { container } = render(<><CheckIcon /><ArrowIcon /><BackIcon /></>)

    expect(container.querySelectorAll('svg')).toHaveLength(3)
  })
})
