import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackComposer from './FeedbackComposer'

describe('FeedbackComposer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends product feedback to the app owners', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    render(<FeedbackComposer onClose={vi.fn()} />)

    await user.selectOptions(screen.getByLabelText(/what is this about/i), 'Bug')
    await user.selectOptions(screen.getByLabelText(/how does it feel/i), 'Blocked')
    await user.type(screen.getByLabelText(/short summary/i), 'Export is stuck')
    await user.type(screen.getByLabelText(/feedback for the app owners/i), 'The resume export spinner never ends.')
    await user.type(screen.getByLabelText(/what would make it better/i), 'Show an error and retry option.')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => expect(screen.getByText(/feedback sent/i)).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith('/api/feedback', expect.objectContaining({ method: 'POST', credentials: 'same-origin', body: expect.stringContaining('"category":"Bug"') }))
  })

  it('shows the sending animation while feedback is being sent', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}))

    render(<FeedbackComposer onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/short summary/i), 'Navigation idea')
    await user.type(screen.getByLabelText(/feedback for the app owners/i), 'Let me jump between sections faster.')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    expect(screen.getByRole('status', { name: /sending feedback/i })).toBeInTheDocument()
    expect(screen.getByText(/sending feedback to clausule/i)).toBeInTheDocument()
  })
})
