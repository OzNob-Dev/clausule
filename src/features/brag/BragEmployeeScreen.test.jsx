import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BragEmployeeScreen from './BragEmployeeScreen'

vi.mock('@features/brag/components/BragRail', () => ({
  default: () => <nav aria-label="Brag navigation" />,
}))

vi.mock('@features/brag/components/BragIdentitySidebar', () => ({
  default: () => <aside aria-label="Profile and evidence" />,
}))

vi.mock('@features/brag/components/EntryComposer', () => ({
  default: () => <div role="form" aria-label="Add a new entry">Composer</div>,
}))

describe('BragEmployeeScreen', () => {
  beforeEach(() => {})

  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('places the add-entry action at the top instead of the manager note card', async () => {
    render(<BragEmployeeScreen initialEntries={[{
      id: 'new',
      title: 'Newest win',
      body: 'A fresh result.',
      entry_date: '2025-12-01',
      created_at: '2025-12-01T01:00:00Z',
      strength: 'Good',
      strength_hint: 'Add more evidence types to reach Solid',
      brag_entry_evidence: [{ type: 'Work artefact' }],
    }]} />)

    expect(screen.getByRole('button', { name: /add a win/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add feedback/i })).toHaveAttribute('href', '/brag/feedback')
    expect(screen.queryByText(/from your manager/i)).not.toBeInTheDocument()
  })

  it('renders server-provided entries with newest entries first and no initial client fetch', () => {
    const { container } = render(<BragEmployeeScreen initialEntries={[
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
    ]} />)

    expect(screen.getByText('Newest win')).toBeInTheDocument()
    expect(screen.getByText('Older win')).toBeInTheDocument()
    expect(container.querySelectorAll('.be-entry-card')[0]).toHaveTextContent('Newest win')
    expect(screen.queryByRole('heading', { name: /you've done great things/i })).not.toBeInTheDocument()
  })

  it('supports arrow key tab navigation when entries are present', async () => {
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

  it('opens the composer from the empty state', async () => {
    render(<BragEmployeeScreen />)

    await screen.findByRole('heading', { name: /you've done great things/i })
    expect(screen.queryByRole('tablist', { name: /brag document views/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
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
    render(<BragEmployeeScreen initialEntriesError="Could not load entries. Please refresh and try again." />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/could not load entries/i))
  })
})
