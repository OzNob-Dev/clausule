import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { CategoryDot, CategoryPill } from './CategoryPill'
import { CodeEmail } from './CodeEmail'
import { Modal } from './Modal'
import { ThinkingDots } from './ThinkingDots'

describe('UI components', () => {
  it('renders base display components with accessible text', () => {
    render(
      <>
        <Avatar initials="AL" bg="#111" color="#fff" />
        <Button>Save</Button>
        <CategoryPill cat="conduct" showDot />
        <CodeEmail to="ada@example.com" />
        <ThinkingDots />
      </>
    )

    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByText('Conduct')).toBeInTheDocument()
    expect(screen.getByText(/To:/)).toHaveTextContent('ada@example.com')
    expect(screen.getByLabelText('Demo verification email')).toBeInTheDocument()
  })

  it('reveals email code digits when requested', () => {
    render(<CodeEmail to="ada@example.com" code="123456" revealed />)

    expect(screen.getByLabelText('Verification code sent to your email')).toHaveTextContent('123456')
  })

  it('handles category dot interactions', () => {
    const onClick = vi.fn()

    render(
      <CategoryDot cat="dev" onClick={onClick} />
    )

    fireEvent.click(screen.getByTitle('Filter by Development'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('traps focus, inerts the background, and restores focus on close', async () => {
    const user = userEvent.setup()

    function ModalHarness() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open modal</button>
          <Modal open={open} onClose={() => setOpen(false)} title="Confirm" footer={<button type="button">Done</button>}>
            <input aria-label="Confirmation name" autoFocus />
          </Modal>
        </>
      )
    }

    render(<ModalHarness />)

    const trigger = screen.getByRole('button', { name: 'Open modal' })
    const focusSpy = vi.spyOn(trigger, 'focus')
    trigger.focus()
    await user.click(trigger)

    expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Confirmation name' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    expect(trigger.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(trigger.closest('[inert]')).not.toBeNull()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Confirm' })).not.toBeInTheDocument()
    await waitFor(() => expect(focusSpy).toHaveBeenCalled())
    expect(trigger.closest('[aria-hidden="true"]')).toBeNull()
    expect(trigger.closest('[inert]')).toBeNull()
  })
})
