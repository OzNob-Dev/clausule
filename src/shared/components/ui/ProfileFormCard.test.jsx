import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileFormCard } from './ProfileFormCard'

describe('ProfileFormCard', () => {
  it('renders the profile card shell', () => {
    render(<ProfileFormCard><p>Body</p></ProfileFormCard>)

    expect(screen.getByRole('form', { name: 'Personal details form' })).toBeInTheDocument()
    expect(screen.getByText('Your profile')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })
})
