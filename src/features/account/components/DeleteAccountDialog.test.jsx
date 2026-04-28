import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteAccountDialog } from './DeleteAccountDialog'

const deleteAccount = vi.fn()

vi.mock('@features/account/hooks/useDeleteAccount', () => ({
  useDeleteAccount: () => ({ deleteAccount, deleting: false }),
}))

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires exact DELETE confirmation before account deletion', async () => {
    const user = userEvent.setup()

    render(<DeleteAccountDialog open onClose={vi.fn()} />)

    const dialog = screen.getByRole('dialog', { name: /delete your account/i })
    const deleteButton = within(dialog).getByRole('button', { name: /delete account/i })

    expect(deleteButton).toBeDisabled()
    expect(within(dialog).getByText(/there is no recovery option/i)).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/type delete to confirm/i), 'DELETE')
    await user.click(deleteButton)

    expect(deleteAccount).toHaveBeenCalledTimes(1)
  })

  it('shows a recovery message when deletion fails', async () => {
    const user = userEvent.setup()
    deleteAccount.mockRejectedValueOnce(new Error('Delete failed'))

    render(<DeleteAccountDialog open onClose={vi.fn()} />)

    const dialog = screen.getByRole('dialog', { name: /delete your account/i })

    await user.type(within(dialog).getByLabelText(/type delete to confirm/i), 'DELETE')
    await user.click(within(dialog).getByRole('button', { name: /delete account/i }))

    await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent(/could not delete your account/i))
  })
})
