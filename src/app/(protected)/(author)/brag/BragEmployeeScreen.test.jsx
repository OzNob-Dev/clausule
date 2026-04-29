import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileStore } from '@auth/store/useProfileStore'
import BragEmployeeScreen from './BragEmployeeScreen'

vi.mock('@brag/components/EntryComposer', () => ({
  default: () => <div role="form" aria-label="Add a new entry">Composer</div>,
}))

describe('BragEmployeeScreen', () => {
  beforeEach(() => {
    act(() => {
      useProfileStore.getState().clearProfile()
      useProfileStore.getState().setProfile({
        department: 'Anthropic',
        jobTitle: 'Senior Product Designer',
      })
    })
  })

  afterEach(() => {
    act(() => {
      useProfileStore.getState().clearProfile()
    })
    window.history.pushState({}, '', '/')
  })

  it('renders the read-only timeline in newest-first order', () => {
    const { container } = render(<BragEmployeeScreen view="brag" initialEntries={[
      {
        id: 'old',
        title: 'Older win',
        body: 'A solid earlier result.',
        entry_date: '2024-08-01',
        created_at: '2024-08-01T01:00:00Z',
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
    ]} />)

    expect(screen.getByRole('heading', { name: /your entries/i })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /choose a year/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2025' })).toHaveClass('be-doc-year-tab--active')
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2025' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2024' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '2024' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Anthropic')).toHaveLength(1)
    expect(screen.getAllByText('Senior Product Designer')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /add a win/i })).toHaveClass('justify-start')
    expect(screen.queryByRole('button', { name: /previous year/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next year/i })).not.toBeInTheDocument()
    expect(container.querySelectorAll('.be-doc-entry-card')[0]).toHaveTextContent('Newest win')
  })

  it('shows the resume view without tabs', () => {
    render(<BragEmployeeScreen view="resume" initialEntries={[{
      id: 'new',
      title: 'Newest win',
      body: 'A fresh result.',
      entry_date: '2025-12-01',
      created_at: '2025-12-01T01:00:00Z',
      strength: 'Solid',
      strength_hint: 'Add a third evidence type to reach Strong',
      brag_entry_evidence: [{ type: 'Metrics / data' }],
    }]} />)

    expect(screen.getByRole('heading', { name: /resume/i })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('keeps the listing read only', () => {
    render(<BragEmployeeScreen view="brag" initialEntries={[{
      id: 'new',
      title: 'Newest win',
      body: 'A fresh result.',
      entry_date: '2025-12-01',
      created_at: '2025-12-01T01:00:00Z',
      strength: 'Solid',
      strength_hint: 'Add a third evidence type to reach Strong',
      brag_entry_evidence: [{ type: 'Metrics / data' }],
    }]} />)

    expect(screen.getByRole('button', { name: /add a win/i })).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /add feedback/i })).not.toBeInTheDocument()
  })

  it('opens the composer from the add-win button', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<BragEmployeeScreen view="brag" initialEntries={[{
      id: 'new',
      title: 'Newest win',
      body: 'A fresh result.',
      entry_date: '2025-12-01',
      created_at: '2025-12-01T01:00:00Z',
      strength: 'Solid',
      strength_hint: 'Add a third evidence type to reach Strong',
      brag_entry_evidence: [{ type: 'Metrics / data' }],
    }]} />)

    await user.click(screen.getByRole('button', { name: /add a win/i }))
    expect(screen.getByRole('form', { name: /add a new entry/i })).toBeInTheDocument()
  })

  it('keeps the company and role on one line when profile values are missing', () => {
    act(() => {
      useProfileStore.getState().clearProfile()
    })

    render(<BragEmployeeScreen view="brag" initialEntries={[{
      id: 'new',
      title: 'Newest win',
      body: 'A fresh result.',
      entry_date: '2025-12-01',
      created_at: '2025-12-01T01:00:00Z',
      strength: 'Solid',
      strength_hint: 'Add a third evidence type to reach Strong',
      brag_entry_evidence: [{ type: 'Metrics / data' }],
    }]} />)

    expect(screen.getByText('Team or business unit')).toBeInTheDocument()
    expect(screen.getByText('Current role title')).toBeInTheDocument()
  })

  it('falls back to the empty state when there are no entries', async () => {
    render(<BragEmployeeScreen view="brag" />)

    expect(await screen.findByRole('heading', { name: /you've done great things/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /your entries/i })).not.toBeInTheDocument()
  })

  it('opens the composer from the empty state cta', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<BragEmployeeScreen view="brag" />)

    await user.click(await screen.findByRole('button', { name: /add your first entry/i }))
    expect(screen.getByRole('form', { name: /add a new entry/i })).toBeInTheDocument()
  })

  it('shows a helpful load error when entries cannot be retrieved', async () => {
    render(<BragEmployeeScreen view="brag" initialEntriesError="Could not load entries. Please refresh and try again." />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/could not load entries/i))
  })
})
