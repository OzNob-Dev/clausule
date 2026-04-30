import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SignupPanelSummary from './SignupPanelSummary'

describe('SignupPanelSummary', () => {
  it('renders the plan summary', () => {
    render(<SignupPanelSummary />)

    expect(screen.getByText('Individual plan')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
  })
})
