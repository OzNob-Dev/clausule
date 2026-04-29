import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ComingSoon from './ComingSoon'

describe('ComingSoon', () => {
  it('renders the landing copy', () => {
    render(<ComingSoon />)

    expect(screen.getByText(/The intelligence layer for your professional interactions/i)).toBeInTheDocument()
    expect(screen.getByText('© 2026')).toBeInTheDocument()
  })
})
