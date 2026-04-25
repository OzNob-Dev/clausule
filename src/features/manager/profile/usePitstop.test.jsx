import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePitstop } from './usePitstop'

function PitstopHarness({ pageKey }) {
  const { value, select, saved } = usePitstop(pageKey)

  return (
    <div>
      <div>{value}</div>
      <div>{saved ? 'saved' : 'idle'}</div>
      <button type="button" onClick={() => select('y')}>Choose y</button>
    </div>
  )
}

describe('usePitstop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears the saved state after reloading a different page key', () => {
    const { rerender } = render(<PitstopHarness pageKey="entries" />)

    fireEvent.click(screen.getByRole('button', { name: /choose y/i }))
    expect(screen.getByText('saved')).toBeInTheDocument()

    rerender(<PitstopHarness pageKey="feedback" />)
    vi.advanceTimersByTime(2200)

    expect(screen.getByText('idle')).toBeInTheDocument()
  })
})
