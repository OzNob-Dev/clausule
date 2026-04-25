import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeedbackScreen from './FeedbackScreen'

vi.mock('@features/brag/components/BragRail', () => ({
  default: () => <nav aria-label="Brag navigation" />,
}))

vi.mock('@features/brag/components/BragIdentitySidebar', () => ({
  default: () => <aside aria-label="Feedback guidance">Feedback sidebar</aside>,
}))

vi.mock('@features/brag/components/FeedbackCenter', () => ({
  default: () => <section aria-label="Feedback centre">Feedback centre</section>,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('FeedbackScreen', () => {
  it('renders the dedicated feedback composer page', () => {
    render(<FeedbackScreen />)

    expect(screen.getByRole('complementary', { name: /feedback guidance/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /feedback centre/i })).toBeInTheDocument()
  })
})
