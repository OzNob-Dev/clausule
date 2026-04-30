import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ResumeTab from './ResumeTab'
import { useProfileStore } from '@auth/store/useProfileStore'

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
    expect(screen.getByText(/resume edits stay only in this browser tab for now/i)).toBeInTheDocument()
    expect(document.querySelector('[contenteditable=\"true\"]')).toBeNull()
  })

  it('reports clipboard failures without announcing a false copy success', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Denied'))
    const { container } = render(<ResumeTab entries={[{ title: 'Shipped auth migration', body: 'Reduced deploy risk.' }]} />)

    fireEvent.click(screen.getByRole('button', { name: /generate resume/i }))
    act(() => vi.advanceTimersByTime(1400))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy text/i }))
      await Promise.resolve()
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/could not copy resume text/i)
    expect(container.querySelector('.be-cv-copied')).not.toHaveClass('be-cv-copied--show')
  })
})
