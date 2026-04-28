import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LinkedInImportScreen from './LinkedInImportScreen'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const push = vi.fn()
const apiJson = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@shared/utils/api', () => ({
  apiJson: (...args) => apiJson(...args),
  jsonRequest: (body, init = {}) => ({ ...init, body }),
}))

describe('LinkedInImportScreen', () => {
  beforeEach(() => {
    push.mockClear()
    apiJson.mockReset()
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

    apiJson.mockResolvedValueOnce({ session })
    apiJson.mockResolvedValueOnce({ session: { ...session, status: 'published', linkedin_import_items: session.linkedin_import_items }, entries: [{ id: 'entry-1', title: 'Improved delivery' }] })

    renderWithQueryClient(<LinkedInImportScreen initialSession={session} />)

    await user.click(screen.getByRole('button', { name: /publish to brag doc/i }))
    expect(apiJson).toHaveBeenCalledWith('/api/brag/linkedin/imports/session-1/publish', expect.objectContaining({ method: 'POST' }))
  })
})
