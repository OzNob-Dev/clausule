import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('@feedback/FeedbackScreen', () => ({
  default: ({ view }) => <div>Feedback screen:{view}</div>,
}))

describe('feedback page', () => {
  it('renders the compose feedback route', () => {
    render(<Page />)
    expect(screen.getByText('Feedback screen:compose')).toBeInTheDocument()
  })
})
