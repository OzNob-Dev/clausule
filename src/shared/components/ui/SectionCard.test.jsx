import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionCard } from './SectionCard'

describe('SectionCard', () => {
  it('renders the profile card shell', () => {
    render(<SectionCard as="form" ariaLabel="Personal details form" title="Your profile" meta="Account settings"><p>Body</p></SectionCard>)

    const form = screen.getByRole('form', { name: 'Personal details form' })
    const title = screen.getByText('Your profile')

    expect(form).toBeInTheDocument()
    expect(form).toHaveClass('border-[0.5px]', 'rounded-[16px]')
    expect(title).toHaveClass('text-[28px]', 'leading-none')
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('supports custom shell copy and class names', () => {
    render(
      <SectionCard
        as="form"
        ariaLabel="Billing details form"
        title="Billing"
        meta={null}
        className="custom-card"
        headerClassName="custom-head"
        titleClassName="custom-title"
        bodyClassName="custom-body"
      >
        <p>Billing body</p>
      </SectionCard>
    )

    const form = screen.getByRole('form', { name: 'Billing details form' })

    expect(form).toHaveClass('custom-card')
    expect(form.firstChild).toHaveClass('custom-head')
    expect(screen.getByText('Billing')).toHaveClass('custom-title')
    expect(screen.queryByText('Account settings')).not.toBeInTheDocument()
    expect(screen.getByText('Billing body')).toBeInTheDocument()
  })
})
