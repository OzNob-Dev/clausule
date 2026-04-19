import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KanbanBoard } from './KanbanBoard'
import { KanbanCard } from './KanbanCard'

const employee = {
  name: 'Ada Lovelace',
  role: 'Engineer',
  team: 'Platform',
  av: 'AL',
  avBg: '#111',
  avCol: '#fff',
  ps: 'g',
  entries: 3,
  last: '2026-04-01',
}

describe('Dashboard components', () => {
  it('renders kanban columns and cards', () => {
    render(<KanbanBoard employees={[employee]} />)

    expect(screen.getByText('Going well')).toBeInTheDocument()
    expect(screen.getByText('Working on it')).toBeInTheDocument()
    expect(screen.getByText('Needs work')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getAllByText('None')).toHaveLength(2)
  })

  it('renders a card link to the profile page', () => {
    render(<KanbanCard emp={employee} />)

    expect(screen.getByRole('link', { name: /ada lovelace/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByText('3 entries')).toBeInTheDocument()
  })
})
