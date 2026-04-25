import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AlertThresholdCard from './AlertThresholdCard'

describe('AlertThresholdCard', () => {
  it('uses a keyboard-operable switch control for combined alerts', async () => {
    const user = userEvent.setup()
    const onToggleCombined = vi.fn()

    render(
      <AlertThresholdCard
        combined
        onToggleCombined={onToggleCombined}
        values={{ conductThreshold: 3, escalationThreshold: 2, needsWorkWeeks: 4 }}
        onChangeThreshold={vi.fn()}
        timeWindow="60 days"
        onChangeWindow={vi.fn()}
      />
    )

    const toggle = screen.getByRole('switch', { name: 'Combined alerts' })
    toggle.focus()
    await user.keyboard(' ')
    await user.keyboard('{Enter}')

    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(onToggleCombined).toHaveBeenCalledTimes(2)
  })
})
