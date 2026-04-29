import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BypassGate from './BypassGate'
import ComingSoon from './ComingSoon'

describe('General components', () => {
  it('renders the coming soon page copy', () => {
    render(<ComingSoon />)

    expect(screen.getByText(/intelligence layer/i)).toBeInTheDocument()
    expect(screen.getByText(/CLAU/i)).toBeInTheDocument()
  })

  it('shows children after bypass is granted', async () => {
    localStorage.setItem('clausule_dev_accexx', 'granted')

    render(<BypassGate><div>App content</div></BypassGate>)

    await waitFor(() => expect(screen.getByText('App content')).toBeInTheDocument())
  })

  it('shows children after bypass is enabled from the query string', async () => {
    localStorage.removeItem('clausule_dev_accexx')
    window.history.pushState({}, '', '/?bypass=true')

    render(<BypassGate><div>App content</div></BypassGate>)

    await waitFor(() => expect(screen.getByText('App content')).toBeInTheDocument())
  })
})
