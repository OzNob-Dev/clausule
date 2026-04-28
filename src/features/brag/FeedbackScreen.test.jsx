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

function mockFeedbackFetch({ getBody, postBody }) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init = {}) => {
    if (init?.method === 'POST') {
      return new Response(JSON.stringify(postBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(getBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

describe('FeedbackScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockReset()
    useProfileStore.getState().clearProfile()
    useProfileStore.getState().setProfile({ email: 'ada@example.com' })
  })

  it('renders the feedback tabs and composer', () => {
    renderWithQueryClient(<FeedbackScreen />)

    expect(screen.getByRole('heading', { name: /tell the clausule team what would make this better/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /send feedback/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /feedback history/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/what is this about/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/how does it feel/i)).toBeInTheDocument()
  })

  it('sends feedback from the composer tab', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFeedbackFetch({
      getBody: { feedback: [] },
      postBody: {
        ok: true,
        feedback: {
          id: 'feedback-1',
          category: 'Bug',
          feeling: 'Blocking work',
          subject: 'Export is stuck',
          message: 'The resume export spinner never ends.',
          improvement: 'Show an error and retry option.',
          contact_ok: true,
          created_at: '2026-04-20T10:00:00.000Z',
          replies: [],
        },
      },
    })

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

  it('shows the feedback history tab', async () => {
    const user = userEvent.setup()
    mockFeedbackFetch({
      getBody: {
        feedback: [{
          id: 'feedback-1',
          category: 'Idea',
          feeling: 'Just noting',
          subject: 'jj',
          message: 'bnv',
          created_at: '2026-04-27T10:00:00.000Z',
          replies: [{
            id: 'reply-1',
            author_name: 'Clausule team',
            body: 'Thanks for the note.',
            from_team: true,
            created_at: '2026-04-27T11:00:00.000Z',
          }],
        }],
      },
      postBody: { ok: true, feedback: null },
    })

    renderWithQueryClient(<FeedbackScreen />)

    await user.click(screen.getByRole('tab', { name: /feedback history/i }))

    expect(await screen.findByRole('heading', { name: /back and forth with the clausule team/i })).toBeInTheDocument()
    expect(screen.getByText('jj')).toBeInTheDocument()
    expect(screen.getByText('bnv')).toBeInTheDocument()
    expect(screen.getByText('Thanks for the note.')).toBeInTheDocument()
  })
})
