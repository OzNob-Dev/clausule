import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Layout from './layout'

vi.mock('@brag/components/BragIdentitySidebar', () => ({
  default: ({ activePage, eyebrow }) => <div>{activePage}:{eyebrow}</div>,
}))

describe('mfa exempt author layout', () => {
  it('renders the settings sidebar and children', () => {
    render(<Layout><div>open</div></Layout>)
    expect(screen.getByText('settings:Clausule · Settings')).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
  })
})
