import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileRail } from './ProfileRail'

describe('ProfileRail', () => {
  it('marks the profile route active and renders the user summary', () => {
    render(
      <ProfileRail
        pathname="/profile"
        profile={{ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }}
        onLogout={() => {}}
      />
    )

    expect(screen.getByRole('link', { name: 'Personal details' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
  })
})
