import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EntryComposer from './EntryComposer'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const createEntryAction = vi.fn()

vi.mock('@actions/brag-actions', () => ({
  createEntryAction: (...args) => createEntryAction(...args),
}))

describe('EntryComposer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    createEntryAction.mockReset()
  })

  it('posts a new brag entry to the API and returns the saved row', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    createEntryAction.mockResolvedValueOnce({
      entry: {
        id: 'entry-1',
        title: 'Won migration',
        body: 'Cut deployment risk.',
        entry_date: '2026-04-20',
        strength: 'Good',
        strength_hint: 'Add more evidence types to reach Solid',
      },
    })

    renderWithQueryClient(<EntryComposer onSave={onSave} onClose={vi.fn()} />)

    const form = screen.getByRole('form', { name: 'Add a new entry' })

    expect(form).toBeInTheDocument()
    expect(form).toHaveClass('max-w-[860px]', 'rounded-[16px]', 'border-[0.5px]')
    expect(screen.getByRole('button', { name: 'Close form' })).toBeInTheDocument()
    expect(screen.getByText('New entry')).toHaveClass('text-[28px]', 'leading-none', 'text-[var(--cl-surface-muted-15)]')

    await user.type(screen.getByPlaceholderText(/what did you achieve/i), 'Won migration')
    await user.type(screen.getByPlaceholderText(/describe what you did/i), 'Cut deployment risk.')
    await user.click(screen.getByRole('button', { name: /work artefact/i }))
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      entry: expect.objectContaining({ id: 'entry-1', title: 'Won migration' }),
      evidenceTypes: ['Work artefact'],
    }))
    expect(createEntryAction).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Won migration',
      evidence_types: ['Work artefact'],
    }))
  })

  it('shows an error when the API save fails', async () => {
    const user = userEvent.setup()
    createEntryAction.mockRejectedValueOnce(new Error('failed'))

    renderWithQueryClient(<EntryComposer onSave={vi.fn()} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/what did you achieve/i), 'Won migration')
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not save/i)
  })

  it('shows an honest upload notice while file evidence is unavailable', () => {
    renderWithQueryClient(<EntryComposer onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText(/file upload is not available yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /drop files here or click to browse/i })).not.toBeInTheDocument()
  })
})
