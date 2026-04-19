import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignupStepPayment from './SignupStepPayment'
import { useSubscriptionStore } from '@features/signup/store/useSubscriptionStore'

describe('SignupStepPayment integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSubscriptionStore.setState({ amountCents: 0, currency: '', interval: '' })
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ ok: true, role: 'employee' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  it('sets the monthly AUD amount in zustand and sends it when subscribing', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    render(
      <SignupStepPayment
        accountData={{ email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' }}
        initialData={{ cardName: '', cardNum: '', expiry: '', cvc: '' }}
        onBack={vi.fn()}
        onNext={onNext}
      />
    )

    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => expect(onNext).toHaveBeenCalled())
    expect(useSubscriptionStore.getState()).toMatchObject({ amountCents: 500, currency: 'AUD', interval: 'month' })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      subscription: { amountCents: 500, currency: 'AUD', interval: 'month' },
    })
  })
})
