import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FeedbackCenter from './FeedbackCenter'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const listFeedbackThreadsAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@actions/brag-actions', () => ({
  listFeedbackThreadsAction: (...args) => listFeedbackThreadsAction(...args),
  sendFeedbackAction: vi.fn(),
}))

describe('FeedbackCenter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    listFeedbackThreadsAction.mockReset()
  })

  it('shows feedback threads with Clausule team replies', async () => {
    const user = userEvent.setup()
    listFeedbackThreadsAction.mockResolvedValueOnce([{
      id: 'feedback-1',
      category: 'Idea',
      feeling: 'Love it',
      subject: 'Keyboard shortcuts',
      message: 'Please add j/k navigation.',
      created_at: '2026-04-20T10:00:00.000Z',
      replies: [{
        id: 'reply-1',
        author_name: 'Clausule team',
        body: 'Tiny keyboard goblin assigned.',
        from_team: true,
        created_at: '2026-04-20T11:00:00.000Z',
      }],
    }])

    renderWithQueryClient(<FeedbackCenter userEmail="ada@example.com" onClose={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /send feedback/i })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: /feedback centre/i }))

    await waitFor(() => expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument())
    expect(screen.getByText('Please add j/k navigation.')).toBeInTheDocument()
    expect(screen.getByText('Tiny keyboard goblin assigned.')).toBeInTheDocument()
  })

  it('supports arrow key tab navigation', async () => {
    const user = userEvent.setup()
    listFeedbackThreadsAction.mockResolvedValueOnce([])

    renderWithQueryClient(<FeedbackCenter userEmail="ada@example.com" onClose={vi.fn()} />)

    const composeTab = screen.getByRole('tab', { name: /send feedback/i })
    const centreTab = screen.getByRole('tab', { name: /feedback centre/i })

    composeTab.focus()
    await user.keyboard('{ArrowRight}')

    expect(centreTab).toHaveFocus()
    expect(centreTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: /feedback centre/i })).toBeVisible()
  })

  it('waits to fetch threads until the feedback-centre tab is opened', async () => {
    const user = userEvent.setup()
    listFeedbackThreadsAction.mockResolvedValueOnce([])

    renderWithQueryClient(<FeedbackCenter userEmail="ada@example.com" onClose={vi.fn()} />)

    expect(listFeedbackThreadsAction).not.toHaveBeenCalled()

    await user.click(screen.getByRole('tab', { name: /feedback centre/i }))

    await waitFor(() => expect(listFeedbackThreadsAction).toHaveBeenCalledTimes(1))
  })

  it('shows a real error when feedback threads fail to load', async () => {
    const user = userEvent.setup()
    listFeedbackThreadsAction.mockRejectedValueOnce(new Error('Backend unavailable'))

    renderWithQueryClient(<FeedbackCenter userEmail="ada@example.com" onClose={vi.fn()} />)

    await user.click(screen.getByRole('tab', { name: /feedback centre/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/backend unavailable/i)
  })
})
