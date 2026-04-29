import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SsoButtons from './SsoButtons'

describe('SsoButtons', () => {
  it('renders nothing when no providers are enabled', () => {
    const { container } = render(<SsoButtons config={{ google: false, microsoft: false, apple: false }} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders enabled providers as login links', () => {
    render(<SsoButtons config={{ google: true, microsoft: false, apple: true }} />)

    expect(screen.getByText('or continue with')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/auth/sso/google')
    expect(screen.getByRole('link', { name: 'Continue with Apple' })).toHaveAttribute('href', '/api/auth/sso/apple')
  })
})
