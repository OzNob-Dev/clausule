import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('public page', () => {
  it('renders ComingSoon content as a plain page', () => {
    render(<Page />)

    expect(screen.getByText(/The intelligence layer for your professional interactions/i)).toBeInTheDocument()
  })
})
