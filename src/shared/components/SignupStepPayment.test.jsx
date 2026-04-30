import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignupStepPayment from './SignupStepPayment'
import { renderWithQueryClient } from '@shared/test/renderWithQueryClient'

describe('SignupStepPayment integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ ok: true, role: 'employee' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  it('sends the fixed rollout plan without collecting card details', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    renderWithQueryClient(
      <SignupStepPayment
        accountData={{ email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' }}
        onBack={vi.fn()}
        onNext={onNext}
      />
    )

    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument()
    expect(screen.getByText(/does not ask for or store card details/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /activate account/i }))

    await waitFor(() => expect(onNext).toHaveBeenCalled())
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      subscription: { amountCents: 500, currency: 'AUD', interval: 'month' },
    })
  })
})
