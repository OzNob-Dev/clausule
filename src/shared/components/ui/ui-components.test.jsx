import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { CategoryDot, CategoryPill } from './CategoryPill'
import CodeEmail from './CodeEmail'
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

  it('handles modal and category dot interactions', () => {
    const onClose = vi.fn()
    const onClick = vi.fn()

    render(
      <>
        <CategoryDot cat="dev" onClick={onClick} />
        <Modal open onClose={onClose} title="Confirm" footer={<button>Done</button>}>
          Modal body
        </Modal>
      </>
    )

    fireEvent.click(screen.getByTitle('Filter by Development'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })
})
