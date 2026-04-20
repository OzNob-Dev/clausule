import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackComposer from './FeedbackComposer'

describe('FeedbackComposer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('saves feedback as peer-recognition evidence', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      entry: {
        id: 'feedback-1',
        title: 'Feedback from Priya',
        body: 'Feedback body',
        entry_date: '2026-04-20',
        strength: 'Good',
        strength_hint: 'Add more evidence types to reach Solid',
      },
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))

    render(<FeedbackComposer onSave={onSave} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/who gave it/i), 'Priya')
    await user.type(screen.getByLabelText(/role or team/i), 'Product lead')
    await user.type(screen.getByLabelText(/^feedback$/i), 'This changed how the team ships.')
    await user.type(screen.getByLabelText(/why it matters/i), 'Clear product impact.')
    await user.click(screen.getByRole('button', { name: /save feedback/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      entry: expect.objectContaining({ id: 'feedback-1', title: 'Feedback from Priya' }),
      evidenceTypes: ['Peer recognition'],
      files: [],
    }))
    expect(fetchMock).toHaveBeenCalledWith('/api/brag/entries', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      body: expect.stringContaining('"evidence_types":["Peer recognition"]'),
    }))
  })

  it('shows the saving animation while feedback is being saved', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}))

    render(<FeedbackComposer onSave={vi.fn()} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/who gave it/i), 'Jordan')
    await user.type(screen.getByLabelText(/^feedback$/i), 'Great stakeholder management.')
    await user.click(screen.getByRole('button', { name: /save feedback/i }))

    expect(screen.getByRole('status', { name: /saving feedback/i })).toBeInTheDocument()
    expect(screen.getByText(/turning feedback into brag evidence/i)).toBeInTheDocument()
  })
})
