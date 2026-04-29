import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import DevAccessGate from './DevAccessGate'

describe('DevAccessGate', () => {
  beforeEach(() => {
    localStorage.removeItem('clausule_dev_accexx')
    window.history.pushState({}, '', '/')
  })

  it('shows Coming Soon when access is absent', async () => {
    render(<DevAccessGate><div>Unlocked app</div></DevAccessGate>)

    await waitFor(() => expect(screen.getByText(/the intelligence layer for your professional interactions/i)).toBeInTheDocument())
    expect(screen.queryByText('Unlocked app')).not.toBeInTheDocument()
  })

  it('shows children when access is granted', async () => {
    localStorage.setItem('clausule_dev_accexx', 'granted')

    render(<DevAccessGate><div>Unlocked app</div></DevAccessGate>)

    await waitFor(() => expect(screen.getByText('Unlocked app')).toBeInTheDocument())
  })
})
