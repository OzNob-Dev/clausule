import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ResumeTab from './ResumeTab'

describe('ResumeTab', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('renders editable form controls instead of contentEditable fields', async () => {
    render(<ResumeTab />)

    fireEvent.click(screen.getByRole('button', { name: /generate resume/i }))
    act(() => vi.advanceTimersByTime(1400))

    expect(screen.getByRole('textbox', { name: /full name/i })).toHaveValue('Jordan Ellis')
    expect(screen.getByRole('textbox', { name: /professional tagline/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /accomplishment 1/i })).toBeInTheDocument()
    expect(document.querySelector('[contenteditable=\"true\"]')).toBeNull()
  })
})
