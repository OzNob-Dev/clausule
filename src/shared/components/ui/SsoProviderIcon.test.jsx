import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SsoProviderIcon } from './SsoProviderIcon'

describe('SsoProviderIcon', () => {
  it('renders a provider-specific icon and falls back to null for unknown providers', () => {
    const { container, rerender } = render(<SsoProviderIcon provider="google" />)

    expect(container.querySelector('svg')).toBeInTheDocument()

    rerender(<SsoProviderIcon provider="unknown" />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
