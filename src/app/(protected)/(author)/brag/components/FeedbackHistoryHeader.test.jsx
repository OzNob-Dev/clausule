import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FeedbackHistoryHeader from './FeedbackHistoryHeader'

describe('FeedbackHistoryHeader', () => {
  it('renders the feedback history hero copy', () => {
    render(<FeedbackHistoryHeader />)

    expect(screen.getByRole('heading', { name: /back and forth with the clausule team/i })).toBeInTheDocument()
    expect(screen.getByText(/track what you sent and any replies/i)).toBeInTheDocument()
  })
})
