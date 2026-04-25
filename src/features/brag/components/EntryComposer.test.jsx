import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EntryComposer from './EntryComposer'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

describe('EntryComposer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('posts a new brag entry to the API and returns the saved row', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      entry: {
        id: 'entry-1',
        title: 'Won migration',
        body: 'Cut deployment risk.',
        entry_date: '2026-04-20',
        strength: 'Good',
        strength_hint: 'Add more evidence types to reach Solid',
      },
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))

    renderWithQueryClient(<EntryComposer onSave={onSave} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/what did you achieve/i), 'Won migration')
    await user.type(screen.getByPlaceholderText(/describe what you did/i), 'Cut deployment risk.')
    await user.click(screen.getByRole('button', { name: /work artefact/i }))
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      entry: expect.objectContaining({ id: 'entry-1', title: 'Won migration' }),
      evidenceTypes: ['Work artefact'],
    }))
    expect(fetchMock).toHaveBeenCalledWith('/api/brag/entries', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      body: expect.stringContaining('"evidence_types":["Work artefact"]'),
    }))
  })

  it('shows an error when the API save fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'failed' }), { status: 500 }))

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
