import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BragEmployeeScreen from './BragEmployeeScreen'

vi.mock('@features/brag/components/BragRail', () => ({
  default: () => <nav aria-label="Brag navigation" />,
}))

vi.mock('@features/brag/components/BragSidebar', () => ({
  default: () => <aside aria-label="Profile and evidence" />,
}))

vi.mock('@features/brag/components/EntryComposer', () => ({
  default: () => <div role="form" aria-label="Add a new entry">Composer</div>,
}))

describe('BragEmployeeScreen', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ entries: [] }),
    }))
  })

  afterEach(() => {
    window.history.pushState({}, '', '/')
    vi.unstubAllGlobals()
  })

  it('places the add-entry action at the top instead of the manager note card', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        entries: [{
          id: 'new',
          title: 'Newest win',
          body: 'A fresh result.',
          entry_date: '2025-12-01',
          created_at: '2025-12-01T01:00:00Z',
          strength: 'Good',
          strength_hint: 'Add more evidence types to reach Solid',
          brag_entry_evidence: [{ type: 'Work artefact' }],
        }],
      }),
    })

    render(<BragEmployeeScreen />)

    expect(await screen.findByRole('button', { name: /add a win/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add feedback/i })).toHaveAttribute('href', '/brag/feedback')
    expect(screen.queryByText(/from your manager/i)).not.toBeInTheDocument()
  })

  it('loads entries from the database with newest entries first', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        entries: [
          {
            id: 'old',
            title: 'Older win',
            body: 'A solid earlier result.',
            entry_date: '2025-08-01',
            created_at: '2025-08-01T01:00:00Z',
            strength: 'Good',
            strength_hint: 'Add more evidence types to reach Solid',
            brag_entry_evidence: [{ type: 'Work artefact' }],
          },
          {
            id: 'new',
            title: 'Newest win',
            body: 'A fresh result.',
            entry_date: '2025-12-01',
            created_at: '2025-12-01T01:00:00Z',
            strength: 'Solid',
            strength_hint: 'Add a third evidence type to reach Strong',
            brag_entry_evidence: [{ type: 'Metrics / data' }, { type: 'Peer recognition' }],
          },
        ],
      }),
    })

    const { container } = render(<BragEmployeeScreen />)

    expect(await screen.findByText('Newest win')).toBeInTheDocument()
    expect(screen.getByText('Older win')).toBeInTheDocument()
    expect(container.querySelectorAll('.be-entry-card')[0]).toHaveTextContent('Newest win')
    expect(screen.queryByRole('heading', { name: /you've done great things/i })).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/brag/entries?limit=100', expect.objectContaining({ credentials: 'same-origin' }))
  })

  it('opens the composer from the empty state', async () => {
    render(<BragEmployeeScreen />)

    await screen.findByRole('heading', { name: /you've done great things/i })
    expect(screen.queryByRole('tablist', { name: /brag document views/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add a win/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /add your first entry/i }))

    expect(await screen.findByRole('form', { name: /add a new entry/i })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('heading', { name: /you've done great things/i })).not.toBeInTheDocument())
  })

  it('hides the resume panel when there are no entries', async () => {
    render(<BragEmployeeScreen />)

    expect(await screen.findByRole('heading', { name: /you've done great things/i })).toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: /brag document views/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/generate your resume/i)).not.toBeInTheDocument()
  })

  it('shows a helpful load error when entries cannot be retrieved', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Failed to fetch entries' }),
    })

    render(<BragEmployeeScreen />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/could not load entries/i))
  })
})
