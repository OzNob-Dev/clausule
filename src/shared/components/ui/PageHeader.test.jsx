import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('renders configurable eyebrow, title, and description copy', () => {
    render(
      <PageHeader
        className="hero"
        eyebrow="Account"
        eyebrowAriaHidden
        eyebrowClassName="eyebrow"
        title="Security settings"
        titleClassName="title"
        titleId="page-title"
        description="Manage how you sign in to Clausule."
        descriptionClassName="copy"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Security settings' })).toHaveAttribute('id', 'page-title')
    expect(screen.getByText('Account')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Account')).toHaveClass('eyebrow')
    expect(screen.getByText('Manage how you sign in to Clausule.')).toHaveClass('copy')
    expect(screen.getByRole('heading', { name: 'Security settings' })).toHaveClass('title')
  })
})
