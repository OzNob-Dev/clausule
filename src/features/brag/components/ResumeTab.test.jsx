import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ResumeTab from './ResumeTab'
import { useProfileStore } from '@features/auth/store/useProfileStore'

describe('ResumeTab', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useProfileStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      jobTitle: 'Staff Engineer',
      department: 'Platform',
    })
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
    render(<ResumeTab entries={[{ title: 'Shipped auth migration', body: 'Reduced deploy risk.' }]} />)

    fireEvent.click(screen.getByRole('button', { name: /generate resume/i }))
    act(() => vi.advanceTimersByTime(1400))

    expect(screen.getByRole('textbox', { name: /full name/i })).toHaveValue('Ada Lovelace')
    expect(screen.getByRole('textbox', { name: /accomplishment 1/i })).toHaveValue('Shipped auth migration — Reduced deploy risk.')
    expect(screen.getByRole('textbox', { name: /professional tagline/i })).toBeInTheDocument()
    expect(document.querySelector('[contenteditable=\"true\"]')).toBeNull()
  })
})
