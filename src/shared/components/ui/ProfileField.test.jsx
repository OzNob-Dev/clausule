import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileField } from './ProfileField'

describe('ProfileField', () => {
  it('renders a labeled readonly field with a hint', () => {
    render(
      <ProfileField
        id="email"
        label="Email"
        value="ada@example.com"
        readOnly
        hint="Your sign-in email stays unchanged."
      />
    )

    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly')
    expect(screen.getByText('Your sign-in email stays unchanged.')).toBeInTheDocument()
  })
})
