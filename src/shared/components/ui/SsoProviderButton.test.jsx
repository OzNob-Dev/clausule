import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SsoProviderButton } from './SsoProviderButton'

describe('SsoProviderButton', () => {
  it('links to the provider auth path', () => {
    render(<SsoProviderButton provider={{ id: 'google', ctaLabel: 'Continue with Google' }} />)

    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/auth/sso/google')
  })
})
