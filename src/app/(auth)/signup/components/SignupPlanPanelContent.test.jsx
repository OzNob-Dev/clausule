import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SignupPlanPanelContent from './SignupPlanPanelContent'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key) => (key === 'email' ? 'ada@example.com' : null) }),
}))

describe('SignupPlanPanelContent', () => {
  it('renders the next-step copy with the email', () => {
    render(<SignupPlanPanelContent />)

    expect(screen.getByText(/What happens next/i)).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })
})
