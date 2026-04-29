import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignUpPrompt from './SignUpPrompt'

describe('SignUpPrompt', () => {
  it('links to signup', () => {
    render(<SignUpPrompt />)

    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
  })
})
