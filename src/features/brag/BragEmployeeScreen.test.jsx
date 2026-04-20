import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BragEmployeeScreen from './BragEmployeeScreen'

vi.mock('@features/brag/components/BragRail', () => ({
  default: () => <nav aria-label="Brag navigation" />,
}))

vi.mock('@features/brag/components/BragSidebar', () => ({
  default: () => <aside aria-label="Profile and evidence" />,
}))

vi.mock('@features/brag/components/EntryComposer', () => ({
  default: () => <div role="form" aria-label="Add a new entry">Composer</div>,
}))

describe('BragEmployeeScreen', () => {
  it('places the add-entry action at the top instead of the manager note card', () => {
    render(<BragEmployeeScreen />)

    expect(screen.getByRole('button', { name: /add a win/i })).toBeInTheDocument()
    expect(screen.queryByText(/from your manager/i)).not.toBeInTheDocument()
  })
})
