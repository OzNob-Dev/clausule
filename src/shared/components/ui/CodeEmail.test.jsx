import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CodeEmail } from './CodeEmail'

describe('CodeEmail', () => {
  it('renders the demo email with a revealed code', () => {
    render(<CodeEmail to="ada@example.com" code="123456" revealed />)

    expect(screen.getByRole('img', { name: 'Demo verification email' })).toBeInTheDocument()
    expect(screen.getByText('To: ada@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText('Verification code sent to your email')).toHaveTextContent('123456')
  })
})
