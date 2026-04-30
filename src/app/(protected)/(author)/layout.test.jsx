import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuthorLayout from './layout'

let pathname = '/brag'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

vi.mock('@shared/components/BragIdentitySidebar', () => ({
  default: ({ activePage, activeChildPage, eyebrow }) => <div>{activePage}:{activeChildPage ?? ''}:{eyebrow}</div>,
}))

describe('author layout', () => {
  it('passes page config to the sidebar', () => {
    pathname = '/brag/feedback/history'
    render(
      <AuthorLayout>
        <h1 id="feedback-history-title">Feedback history</h1>
        <div>author content</div>
      </AuthorLayout>
    )

    expect(screen.getByText('feedback:feedback-history:Clausule · Feedback')).toBeInTheDocument()
    expect(screen.getByRole('main', { name: 'Feedback history' })).toHaveClass('be-main', 'page-enter', 'bss-screen')
    expect(screen.getByText('author content')).toBeInTheDocument()
  })
})
