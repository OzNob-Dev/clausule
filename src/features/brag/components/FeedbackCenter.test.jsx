import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FeedbackCenter from './FeedbackCenter'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

describe('FeedbackCenter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows feedback threads with Clausule team replies', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      feedback: [{
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
      }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    renderWithQueryClient(<FeedbackCenter userEmail="ada@example.com" onClose={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /send feedback/i })).toHaveAttribute('aria-selected', 'true')
    await user.click(screen.getByRole('tab', { name: /feedback centre/i }))

    await waitFor(() => expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument())
    expect(screen.getByText('Please add j/k navigation.')).toBeInTheDocument()
    expect(screen.getByText('Tiny keyboard goblin assigned.')).toBeInTheDocument()
  })
})
