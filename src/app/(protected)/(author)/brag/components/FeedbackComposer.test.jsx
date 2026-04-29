import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackComposer from './FeedbackComposer'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

const sendFeedbackAction = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@actions/brag-actions', () => ({
  sendFeedbackAction: (...args) => sendFeedbackAction(...args),
}))

describe('FeedbackComposer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sendFeedbackAction.mockReset()
  })

  it('sends product feedback to the app owners', async () => {
    const user = userEvent.setup()
    sendFeedbackAction.mockResolvedValueOnce({ id: 'feedback-1', replies: [] })

    renderWithQueryClient(<FeedbackComposer userEmail="ada@example.com" onClose={vi.fn()} />)

    expect(screen.getByText(/your feedback/i)).toBeInTheDocument()

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'Bug')
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Blocking me')
    await user.type(screen.getByPlaceholderText(/what should we know/i), 'Export is stuck')
    await user.type(screen.getByPlaceholderText(/tell us what happened/i), 'The resume export spinner never ends.')
    await user.type(screen.getByPlaceholderText(/a workflow, design, feature/i), 'Show an error and retry option.')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => expect(screen.getByText(/your feedback has landed/i)).toBeInTheDocument())
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(sendFeedbackAction).toHaveBeenCalledWith(expect.objectContaining({ category: 'Bug', feeling: 'Blocking me' }))
  })

  it('shows the sending animation while feedback is being sent', async () => {
    const user = userEvent.setup()
    sendFeedbackAction.mockReturnValueOnce(new Promise(() => {}))

    renderWithQueryClient(<FeedbackComposer onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/what should we know/i), 'Navigation idea')
    await user.type(screen.getByPlaceholderText(/tell us what happened/i), 'Let me jump between sections faster.')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    expect(screen.getByRole('status', { name: /sending feedback/i })).toBeInTheDocument()
    expect(screen.getByText(/sending feedback to clausule/i)).toBeInTheDocument()
  })
})
