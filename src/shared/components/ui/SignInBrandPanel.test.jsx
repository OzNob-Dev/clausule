import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignInBrandPanel from './SignInBrandPanel'

describe('SignInBrandPanel', () => {
  it('renders the brand link, headline, subtext, and children', () => {
    render(
      <SignInBrandPanel brandHref="/login" headline={'Thoughtful records.\nBetter conversations.'} subtext="Subtext">
        <span>Child</span>
      </SignInBrandPanel>
    )

    expect(screen.getByRole('link', { name: 'clausule' })).toHaveAttribute('href', '/login')
    expect(screen.getByText('Thoughtful records.')).toBeInTheDocument()
    expect(screen.getByText('Better conversations.')).toBeInTheDocument()
    expect(screen.getByText('Subtext')).toBeInTheDocument()
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})
