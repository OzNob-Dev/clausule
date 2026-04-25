import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteAccountSection from './DeleteAccountSection'

vi.mock('@features/account/components/DeleteAccountDialog', () => ({
  DeleteAccountDialog: ({ open }) => open ? (
    <div role="dialog" aria-label="Delete your account?">
      <label htmlFor="delete-confirm-input">Type DELETE to confirm</label>
      <input id="delete-confirm-input" />
    </div>
  ) : null,
}))

describe('DeleteAccountSection', () => {
  it('renders the danger-zone trigger', async () => {
    const onOpenDelete = vi.fn()

    render(
      <DeleteAccountSection
        deleteModal={false}
        onCloseModal={vi.fn()}
        onOpenDelete={onOpenDelete}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /delete account/i }))
    expect(onOpenDelete).toHaveBeenCalledTimes(1)
  })

  it('renders a named confirmation dialog when deletion is open', () => {
    render(
      <DeleteAccountSection
        deleteModal
        onCloseModal={vi.fn()}
        onOpenDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: /delete your account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/type delete to confirm/i)).toBeInTheDocument()
  })
})
