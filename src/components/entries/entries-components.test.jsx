import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EntryCard } from './EntryCard'
import { EntryComposer } from './EntryComposer'

const entry = {
  id: 'entry-1',
  cat: 'perf',
  type: 'Note',
  title: 'Shipped auth',
  body: 'Completed the authentication refactor.',
  date: '2026-04-01',
  tags: ['security'],
}

describe('Entry components', () => {
  it('edits and deletes an entry card', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<EntryCard entry={entry} onDelete={onDelete} />)
    await user.click(screen.getByText('Shipped auth'))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(onDelete).toHaveBeenCalledWith('entry-1')
  })

  it('saves a composed entry only after a title exists', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EntryComposer onSave={onSave} onClose={onClose} />)

    expect(screen.getByRole('button', { name: /save entry/i })).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Title…'), 'Won migration')
    await user.type(screen.getByPlaceholderText('Details…'), 'Evidence added.')
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      cat: 'perf',
      type: 'Note',
      title: 'Won migration',
      body: 'Evidence added.',
    }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
