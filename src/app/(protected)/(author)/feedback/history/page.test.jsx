import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('@feedback/FeedbackScreen', () => ({
  default: ({ view }) => <div>Feedback screen:{view}</div>,
}))

describe('feedback history page', () => {
  it('renders the history feedback route', () => {
    render(<Page />)
    expect(screen.getByText('Feedback screen:history')).toBeInTheDocument()
  })
})
