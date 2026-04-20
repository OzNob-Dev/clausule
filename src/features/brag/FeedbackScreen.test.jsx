import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeedbackScreen from './FeedbackScreen'

vi.mock('@features/brag/components/BragRail', () => ({
  default: () => <nav aria-label="Brag navigation" />,
}))

vi.mock('@features/brag/components/BragSidebar', () => ({
  default: () => <aside aria-label="Feedback guidance">Feedback sidebar</aside>,
}))

vi.mock('@features/brag/components/FeedbackComposer', () => ({
  default: () => <div role="form" aria-label="Send app feedback">Feedback composer</div>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('FeedbackScreen', () => {
  it('renders the dedicated feedback composer page', () => {
    render(<FeedbackScreen />)

    expect(screen.getByRole('complementary', { name: /feedback guidance/i })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: /send app feedback/i })).toBeInTheDocument()
  })
})
