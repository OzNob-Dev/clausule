import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Layout from './layout'

vi.mock('@shared/components/BragIdentitySidebar', () => ({
  default: ({ activePage, eyebrow }) => <div>{activePage}:{eyebrow}</div>,
}))

describe('mfa exempt author layout', () => {
  it('renders the settings sidebar and children', () => {
    render(
      <Layout>
        <h1 id="brag-settings-title">Security settings</h1>
        <div>open</div>
      </Layout>
    )
    expect(screen.getByText('settings:Clausule · Settings')).toBeInTheDocument()
    expect(screen.getByRole('main', { name: 'Security settings' })).toHaveClass('be-main', 'page-enter', 'bss-screen')
    expect(screen.getByText('open')).toBeInTheDocument()
  })
})
