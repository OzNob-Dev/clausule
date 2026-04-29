import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MfaSuccessStep from './MfaSuccessStep'

describe('MfaSuccessStep', () => {
  it('calls onEnterApp from the primary action', async () => {
    const user = userEvent.setup()
    const onEnterApp = vi.fn()

    render(<MfaSuccessStep onEnterApp={onEnterApp} />)

    await user.click(screen.getByRole('button', { name: /enter clausule/i }))
    expect(onEnterApp).toHaveBeenCalledTimes(1)
  })
})
