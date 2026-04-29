import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BragDocEntryCard from './BragDocEntryCard'

describe('BragDocEntryCard', () => {
  it('renders entry details and evidence pills', () => {
    render(
      <BragDocEntryCard
        entry={{
          id: 'new',
          title: 'Newest win',
          body: 'A fresh result.',
          entry_date: '2025-12-01',
          strength: 'Solid',
          strength_hint: 'Add a third evidence type to reach Strong',
          brag_entry_evidence: [{ type: 'Metrics / data' }, { type: 'Peer recognition' }],
        }}
      />
    )

    expect(screen.getByRole('heading', { name: 'Newest win' })).toBeInTheDocument()
    expect(screen.getByText('A fresh result.')).toBeInTheDocument()
    expect(screen.getByText('Solid')).toBeInTheDocument()
    expect(screen.getByText('Add a third evidence type to reach Strong')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Evidence' })).toBeInTheDocument()
    expect(screen.getByText('Metrics')).toHaveClass('be-doc-evidence-tag--gold')
    expect(screen.getByText('Peer recognition')).toHaveClass('be-doc-evidence-tag--blue')
  })
})
