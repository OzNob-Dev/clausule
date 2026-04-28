import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackScreen from './FeedbackScreen'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'
import { useProfileStore } from '@auth/store/useProfileStore'

const push = vi.fn()
const sendFeedbackAction = vi.fn()
const listFeedbackThreadsAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@actions/brag-actions', () => ({
  sendFeedbackAction: (...args) => sendFeedbackAction(...args),
  listFeedbackThreadsAction: (...args) => listFeedbackThreadsAction(...args),
}))

describe('FeedbackScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockReset()
    sendFeedbackAction.mockReset()
    listFeedbackThreadsAction.mockReset()
    useProfileStore.getState().clearProfile()
    useProfileStore.getState().setProfile({ email: 'ada@example.com' })
  })

  it('renders the feedback composer without tabs', () => {
    renderWithQueryClient(<FeedbackScreen view="compose" />)

    expect(screen.getByRole('heading', { name: /tell the clausule team what would make this better/i })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
  })

  it('sends feedback from the composer view', async () => {
    const user = userEvent.setup()
    listFeedbackThreadsAction.mockResolvedValueOnce([])
    sendFeedbackAction.mockResolvedValueOnce({
      id: 'feedback-1',
      category: 'Bug',
      feeling: 'Blocking work',
      subject: 'Export is stuck',
      message: 'The resume export spinner never ends.',
      improvement: 'Show an error and retry option.',
      contact_ok: true,
      created_at: '2026-04-20T10:00:00.000Z',
      replies: [],
    })

    renderWithQueryClient(<FeedbackScreen view="compose" />)

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'Bug')
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Blocking work')
    await user.type(screen.getByPlaceholderText(/what should we know/i), 'Export is stuck')
    await user.type(screen.getByPlaceholderText(/tell us what happened/i), 'The resume export spinner never ends.')
    await user.type(screen.getByPlaceholderText(/a workflow, design, feature/i), 'Show an error and retry option.')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => expect(screen.getByText(/your feedback has landed/i)).toBeInTheDocument())
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(sendFeedbackAction).toHaveBeenCalledWith(expect.objectContaining({ category: 'Bug', feeling: 'Blocking work' }))
  })

  it('renders feedback history without tabs', async () => {
    listFeedbackThreadsAction.mockResolvedValueOnce([{
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
    }])

    renderWithQueryClient(<FeedbackScreen view="history" />)

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /back and forth with the clausule team/i })).toBeInTheDocument()
    expect(await screen.findByText('jj')).toBeInTheDocument()
    expect(screen.getByText('bnv')).toBeInTheDocument()
    expect(screen.getByText('Thanks for the note.')).toBeInTheDocument()
  })
})
