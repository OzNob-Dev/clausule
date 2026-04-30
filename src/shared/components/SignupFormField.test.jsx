import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SignupFormField } from './SignupFormField'

describe('SignupFormField', () => {
  it('renders label, input, and hint', () => {
    render(
      <SignupFormField label="Email" hint="Use your work email" htmlFor="email" inputProps={{ type: 'email' }} />
    )

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByText('Use your work email')).toBeInTheDocument()
  })
})
