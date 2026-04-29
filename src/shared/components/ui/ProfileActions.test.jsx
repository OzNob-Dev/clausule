import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProfileActions } from './ProfileActions'

describe('ProfileActions', () => {
  it('renders the reset and save actions', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(<form><ProfileActions onReset={onReset} /></form>)

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })
})
