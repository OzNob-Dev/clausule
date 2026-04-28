import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FeedbackScreen from './FeedbackScreen'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'
import { useProfileStore } from '@features/auth/store/useProfileStore'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('FeedbackScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockReset()
    useProfileStore.getState().clearProfile()
    useProfileStore.getState().setProfile({ email: 'ada@example.com' })
  })

  it('renders the dedicated feedback form', () => {
    renderWithQueryClient(<FeedbackScreen />)

    expect(screen.getByRole('heading', { name: /tell the clausule team what would make this better/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/what is this about/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/how does it feel/i)).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('sends feedback from the dedicated form', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    renderWithQueryClient(<FeedbackScreen />)

    await user.selectOptions(screen.getByLabelText(/what is this about/i), 'Bug')
    await user.selectOptions(screen.getByLabelText(/how does it feel/i), 'Blocking work')
    await user.type(screen.getByLabelText(/short summary/i), 'Export is stuck')
    await user.type(screen.getByLabelText(/feedback for the app owners/i), 'The resume export spinner never ends.')
    await user.type(screen.getByLabelText(/what would make it better/i), 'Show an error and retry option.')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => expect(screen.getByText(/your feedback has landed/i)).toBeInTheDocument())
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/feedback', expect.objectContaining({ method: 'POST', credentials: 'same-origin' }))
  })
})
