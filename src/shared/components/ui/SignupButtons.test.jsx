import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BackBtn, CtaBtn } from './SignupButtons'

describe('SignupButtons', () => {
  it('handles back and cta actions', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const onCta = vi.fn()

    render(
      <>
        <BackBtn onClick={onBack} />
        <CtaBtn onClick={onCta}>Continue</CtaBtn>
      </>
    )

    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onCta).toHaveBeenCalledTimes(1)
  })
})
