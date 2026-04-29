import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DigitRow from './DigitRow'

describe('DigitRow', () => {
  it('renders six digit inputs and forwards handlers', () => {
    const onChange = vi.fn()
    const onKeyDown = vi.fn()
    const onPaste = vi.fn()
    const inputRefs = { current: [] }

    render(
      <DigitRow
        digits={['1', '2', '3', '4', '5', '6']}
        inputRefs={inputRefs}
        inputState="idle"
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
    )

    expect(screen.getByRole('group', { name: '6-digit code' })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Digit [1-6] of 6/)).toHaveLength(6)
  })
})
