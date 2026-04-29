import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PublicLayout from './layout'

describe('public layout', () => {
  it('renders the public shell', () => {
    render(<PublicLayout><div>Public page</div></PublicLayout>)

    expect(screen.getByRole('navigation', { name: 'Public' })).toBeInTheDocument()
    expect(screen.getByText('Public page')).toBeInTheDocument()
  })
})
