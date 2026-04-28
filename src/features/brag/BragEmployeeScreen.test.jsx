import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import BragEmployeeScreen from './BragEmployeeScreen'

vi.mock('@features/brag/components/EntryComposer', () => ({
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
    const { container } = render(<BragEmployeeScreen initialEntries={[
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
    expect(screen.getByRole('tablist', { name: /brag document views/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2025' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2024' })).toBeInTheDocument()
    expect(screen.getAllByText('Anthropic')).toHaveLength(2)
    expect(screen.getAllByText('Senior Product Designer')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /add a win/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous year/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next year/i })).toBeInTheDocument()
    expect(screen.getByText(/2024 – 2025/)).toBeInTheDocument()
    expect(screen.getByText(/2 entries/)).toBeInTheDocument()
    expect(container.querySelectorAll('.be-doc-entry-card')[0]).toHaveTextContent('Newest win')
  })

  it('keeps the listing read only', () => {
    render(<BragEmployeeScreen initialEntries={[{
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

    render(<BragEmployeeScreen initialEntries={[{
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

    render(<BragEmployeeScreen initialEntries={[{
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

  it('supports arrow key tab navigation when entries are present', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<BragEmployeeScreen initialEntries={[{
      id: 'new',
      title: 'Newest win',
      body: 'A fresh result.',
      entry_date: '2025-12-01',
      created_at: '2025-12-01T01:00:00Z',
      strength: 'Solid',
      strength_hint: 'Add a third evidence type to reach Strong',
      brag_entry_evidence: [{ type: 'Metrics / data' }],
    }]} />)

    const bragTab = screen.getByRole('tab', { name: /brag doc/i })
    const resumeTab = screen.getByRole('tab', { name: /resume/i })

    bragTab.focus()
    await user.keyboard('{ArrowRight}')

    expect(resumeTab).toHaveFocus()
    expect(resumeTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: /resume/i })).toBeVisible()
  })

  it('falls back to the empty state when there are no entries', async () => {
    render(<BragEmployeeScreen />)

    expect(await screen.findByRole('heading', { name: /you've done great things/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /your entries/i })).not.toBeInTheDocument()
  })

  it('shows a helpful load error when entries cannot be retrieved', async () => {
    render(<BragEmployeeScreen initialEntriesError="Could not load entries. Please refresh and try again." />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/could not load entries/i))
  })
})
