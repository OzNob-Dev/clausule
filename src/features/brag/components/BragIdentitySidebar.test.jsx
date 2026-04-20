import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BragIdentitySidebar from './BragIdentitySidebar'

describe('BragIdentitySidebar', () => {
  it('renders profile, note, and overview sections from data', () => {
    render(
      <BragIdentitySidebar
        ariaLabel="Feedback guidance"
        eyebrow="Clausule · Feedback"
        avatarInitials="AL"
        displayName="Ada Lovelace"
        email="ada@example.com"
        noteLabel="Why this matters"
        note="Your note goes straight to the Clausule team."
        overviewLabel="What helps most"
        status="Private"
        statusSub="Seen by app owners only"
        legendTitle="A useful note usually includes"
        legendItems={[{ label: 'What happened', color: 'red' }]}
      />
    )

    expect(screen.getByRole('complementary', { name: /feedback guidance/i })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Your note goes straight to the Clausule team.')).toBeInTheDocument()
    expect(screen.getByText('Private')).toBeInTheDocument()
    expect(screen.getByText('What happened')).toBeInTheDocument()
  })
})
