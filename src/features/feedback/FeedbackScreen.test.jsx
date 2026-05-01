import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackScreen from './FeedbackScreen'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'
import { useProfileStore } from '@auth/store/useProfileStore'
import { apiFetch } from '@shared/utils/api'

const push = vi.fn()
const sendFeedbackAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@shared/utils/api', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@actions/brag-actions', () => ({
  sendFeedbackAction: (...args) => sendFeedbackAction(...args),
}))

describe('FeedbackScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockReset()
    sendFeedbackAction.mockReset()
    apiFetch.mockReset()
    useProfileStore.getState().clearProfile()
    useProfileStore.getState().setProfile({ email: 'ada@example.com' })
  })

  it('renders the feedback composer without tabs', () => {
    renderWithQueryClient(<FeedbackScreen view="compose" />)

    expect(screen.getByRole('heading', { name: /feedback for clausule/i })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getByText(/your feedback/i)).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
  })

  it('sends feedback from the composer view', async () => {
    const user = userEvent.setup()
    sendFeedbackAction.mockResolvedValueOnce({
      id: 'feedback-1',
      category: 'Bug',
      feeling: 'Blocking me',
      subject: 'Export is stuck',
      message: 'The resume export spinner never ends.',
      improvement: 'Show an error and retry option.',
      contact_ok: true,
      created_at: '2026-04-20T10:00:00.000Z',
      replies: [],
    })

    renderWithQueryClient(<FeedbackScreen view="compose" />)

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'Bug')
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Blocking me')
    await user.type(screen.getByPlaceholderText(/what should we know/i), 'Export is stuck')
    await user.type(screen.getByPlaceholderText(/tell us what happened/i), 'The resume export spinner never ends.')
    await user.type(screen.getByPlaceholderText(/a workflow, design, feature/i), 'Show an error and retry option.')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => expect(screen.getByText(/your feedback has landed/i)).toBeInTheDocument())
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(sendFeedbackAction).toHaveBeenCalledWith(expect.objectContaining({ category: 'Bug', feeling: 'Blocking me' }))
  })

  it('renders feedback history without tabs', async () => {
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      feedback: [{
        id: 'feedback-1',
        category: 'Idea',
        feeling: 'Just noting',
        subject: 'jj',
        message: 'bnv',
        created_at: '2026-04-27T10:00:00.000Z',
        replies: [{
          id: 'reply-1',
          author_name: 'Clausule team',
          body: 'Thanks for the note.',
          from_team: true,
          created_at: '2026-04-27T11:00:00.000Z',
        }],
      }],
    }), { status: 200 }))

    renderWithQueryClient(<FeedbackScreen view="history" />)

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(await screen.findByRole('region', { name: /feedback history/i })).toBeInTheDocument()
    expect(await screen.findByText('jj')).toBeInTheDocument()
    expect(screen.getByText('bnv')).toBeInTheDocument()
    expect(screen.getByText('Thanks for the note.')).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/feedback')
  })

  it('renders the empty history mockup when there is no feedback yet', async () => {
    const user = userEvent.setup()
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({ feedback: [] }), { status: 200 }))

    renderWithQueryClient(<FeedbackScreen view="history" />)

    expect(await screen.findByRole('heading', { name: /the conversation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send your first note/i })).toHaveClass('be-feedback-empty-state__cta')
    expect(screen.queryByRole('region', { name: /feedback history/i })).not.toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/feedback')

    await user.click(screen.getByRole('button', { name: /send your first note/i }))
    expect(push).toHaveBeenCalledWith('/feedback')
  })
})
