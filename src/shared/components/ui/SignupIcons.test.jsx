import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { BackIcon } from '@shared/components/ui/icon/BackIcon'
import { CheckIcon } from '@shared/components/ui/icon/CheckIcon'

describe('Generic icons', () => {
  it('renders the svg icons', () => {
    const { container } = render(<><CheckIcon /><ArrowIcon /><BackIcon /></>)

    expect(container.querySelectorAll('svg')).toHaveLength(3)
  })
})
