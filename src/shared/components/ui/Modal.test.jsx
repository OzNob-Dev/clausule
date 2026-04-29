import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { FieldInput } from './Field'
import { Modal } from './Modal'

describe('Modal', () => {
  it('traps focus and restores it on close', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <Button type="button" onClick={() => setOpen(true)}>Open</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Confirm" footer={<Button type="button">Done</Button>}>
            <FieldInput aria-label="Confirmation name" autoFocus />
          </Modal>
        </>
      )
    }

    render(<Harness />)

    const trigger = screen.getByRole('button', { name: 'Open' })
    const focusSpy = vi.spyOn(trigger, 'focus')
    trigger.focus()
    await user.click(trigger)

    expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Confirmation name' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Confirm' })).not.toBeInTheDocument()
    await waitFor(() => expect(focusSpy).toHaveBeenCalled())
  })
})
