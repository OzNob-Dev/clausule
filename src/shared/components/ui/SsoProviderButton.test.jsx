import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SsoProviderButton } from './SsoProviderButton'

const { Link } = vi.hoisted(() => ({
  Link: vi.fn(({ children, external: _external, ...props }) => <a {...props}>{children}</a>),
}))

vi.mock('./Link', () => ({
  Link,
}))

describe('SsoProviderButton', () => {
  it('links to the provider auth path', () => {
    render(<SsoProviderButton provider={{ id: 'google', ctaLabel: 'Continue with Google' }} />)

    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/auth/sso/google')
    expect(Link).toHaveBeenCalledWith(expect.objectContaining({ external: true, href: '/api/auth/sso/google' }), {})
  })
})
