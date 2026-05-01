import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LoadingOverlay from './LoadingOverlay'

describe('LoadingOverlay', () => {
  it('renders the loading status and centered copy structure', () => {
    const { container } = render(<LoadingOverlay />)

    expect(container.querySelector('.loading-overlay-frame')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /just a moment/i })).toBeInTheDocument()
  })

  it('keeps the visual structure in component-owned markup', () => {
    const { container } = render(<LoadingOverlay eyebrow="Please wait" sub="Fetching your data" />)

    expect(container.querySelector('.loading-overlay')).toBeInTheDocument()
    expect(container.querySelector('.loader-canvas')).toBeInTheDocument()
    expect(container.querySelector('.loader-copy')).toBeInTheDocument()
    expect(container.querySelectorAll('.dot')).toHaveLength(3)
  })
})
