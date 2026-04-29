import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FeedbackHistoryThreadList from './FeedbackHistoryThreadList'

describe('FeedbackHistoryThreadList', () => {
  it('renders threaded conversations', () => {
    render(<FeedbackHistoryThreadList threads={[{
      id: 'feedback-1',
      category: 'Idea',
      feeling: 'Just noting',
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
    }]} />)

    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument()
    expect(screen.getByText('Please add j/k navigation.')).toBeInTheDocument()
    expect(screen.getByText('Tiny keyboard goblin assigned.')).toBeInTheDocument()
  })

  it('renders loading, error, and empty states', () => {
    const { rerender } = render(<FeedbackHistoryThreadList loading />)

    expect(screen.getByRole('status')).toHaveTextContent(/gathering the paper trail/i)

    rerender(<FeedbackHistoryThreadList error="Backend unavailable" />)
    expect(screen.getByRole('alert')).toHaveTextContent(/backend unavailable/i)

    rerender(<FeedbackHistoryThreadList filter="replied" />)
    expect(screen.getByText(/no replied threads yet/i)).toBeInTheDocument()
  })
})
