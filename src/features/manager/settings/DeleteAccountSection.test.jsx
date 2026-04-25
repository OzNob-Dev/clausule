import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteAccountSection from './DeleteAccountSection'

describe('DeleteAccountSection', () => {
  it('renders reminder delivery and frequency choices', async () => {
    render(
      <DeleteAccountSection
        confirmReady={false}
        deleteConfirmText=""
        deleteModal={false}
        onCancelDelete={vi.fn()}
        onChangeConfirmText={vi.fn()}
        onCloseModal={vi.fn()}
        onConfirmDelete={vi.fn()}
        onOpenDelete={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Email')).toBeChecked()
    expect(screen.getByLabelText('Weekly')).toBeChecked()

    await userEvent.click(screen.getByLabelText('SMS'))
    await userEvent.click(screen.getByLabelText('Monthly'))

    expect(screen.getByLabelText('SMS')).toBeChecked()
    expect(screen.getByLabelText('Monthly')).toBeChecked()
  })

  it('renders a named confirmation dialog when deletion is open', () => {
    render(
      <DeleteAccountSection
        confirmReady={false}
        deleteConfirmText=""
        deleteModal
        onCancelDelete={vi.fn()}
        onChangeConfirmText={vi.fn()}
        onCloseModal={vi.fn()}
        onConfirmDelete={vi.fn()}
        onOpenDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: /delete your account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/type delete to confirm/i)).toBeInTheDocument()
  })
})
