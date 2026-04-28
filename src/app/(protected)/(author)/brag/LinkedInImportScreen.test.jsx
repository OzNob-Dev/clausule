import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LinkedInImportScreen from './LinkedInImportScreen'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const push = vi.fn()
const createLinkedInImportAction = vi.fn()
const publishLinkedInImportAction = vi.fn()
const updateLinkedInImportAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@actions/brag-actions', () => ({
  createLinkedInImportAction: (...args) => createLinkedInImportAction(...args),
  publishLinkedInImportAction: (...args) => publishLinkedInImportAction(...args),
  updateLinkedInImportAction: (...args) => updateLinkedInImportAction(...args),
}))

describe('LinkedInImportScreen', () => {
  beforeEach(() => {
    push.mockClear()
    createLinkedInImportAction.mockReset()
    publishLinkedInImportAction.mockReset()
    updateLinkedInImportAction.mockReset()
  })

  it('shows the LinkedIn import landing state', () => {
    renderWithQueryClient(<LinkedInImportScreen />)

    expect(screen.getByRole('heading', { name: /import from linkedin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect with linkedin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
  })

  it('renders imported drafts and can publish them', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    const session = {
      id: 'session-1',
      profile_name: 'Ada Lovelace',
      headline: 'Senior Product Designer · Anthropic',
      status: 'ready',
      source_snapshot: {},
      linkedin_import_items: [
        {
          id: 'item-1',
          kind: 'achievement',
          title: 'Improved delivery',
          body: 'Reduced handoff time.',
          organization: 'Anthropic',
          entry_date: '2026-04-28',
          evidence_type: 'Metrics / data',
          selected: true,
          sort_order: 0,
        },
      ],
    }

    publishLinkedInImportAction.mockResolvedValueOnce({ session: { ...session, status: 'published', linkedin_import_items: session.linkedin_import_items }, entries: [{ id: 'entry-1', title: 'Improved delivery' }] })

    renderWithQueryClient(<LinkedInImportScreen initialSession={session} />)

    await user.click(screen.getByRole('button', { name: /publish to brag doc/i }))
    expect(publishLinkedInImportAction).toHaveBeenCalledWith('session-1')
  })
})
