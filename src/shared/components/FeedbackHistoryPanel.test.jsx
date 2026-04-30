import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FeedbackHistoryPanel from './FeedbackHistoryPanel'

describe('FeedbackHistoryPanel', () => {
  it('renders thread history', () => {
    render(<FeedbackHistoryPanel threads={[{
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

  it('renders empty and loading states', () => {
    const { rerender } = render(<FeedbackHistoryPanel loading />)
    expect(screen.getByRole('status')).toHaveTextContent(/gathering the paper trail/i)

    rerender(<FeedbackHistoryPanel error="Backend unavailable" />)
    expect(screen.getByRole('alert')).toHaveTextContent(/backend unavailable/i)

    rerender(<FeedbackHistoryPanel />)
    expect(screen.getByText(/no feedback threads yet/i)).toBeInTheDocument()
  })
})
