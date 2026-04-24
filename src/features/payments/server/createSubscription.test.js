import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createUser, rpc } from '@api/_lib/supabase.js'
import { createSubscription } from './createSubscription.js'

vi.mock('@api/_lib/supabase.js', () => ({
  createUser: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('@features/auth/server/accountRepository.js', () => ({
  findProfileByEmail: vi.fn(async () => ({ profile: null })),
  hasActiveSubscription: vi.fn(async () => ({ hasPaid: false })),
}))

function stripeResponse(data, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: async () => data,
  })
}

describe('createSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'stripe-key'
    global.fetch = vi.fn()
  })

  it('uses the nested auth user id and finalizes the DB write transactionally', async () => {
    createUser.mockResolvedValueOnce({ data: { user: { id: 'user-9' } }, error: null })
    rpc.mockResolvedValueOnce({ data: [{ role: 'employee' }], error: null })
    global.fetch
      .mockImplementationOnce(() => stripeResponse({ id: 'cus_1' }))
      .mockImplementationOnce(() => stripeResponse({ id: 'pm_1' }))
      .mockImplementationOnce(() => stripeResponse({ id: 'cus_1' }))
      .mockImplementationOnce(() => stripeResponse({
        id: 'sub_1',
        status: 'incomplete',
        current_period_start: 1,
        current_period_end: 2,
        latest_invoice: { payment_intent: { client_secret: 'secret_1' } },
      }))

    const result = await createSubscription({
      body: { paymentMethodId: 'pm_1', email: 'Ada@Example.com', firstName: 'Ada', lastName: 'Lovelace' },
      authedId: null,
    })

    expect(result.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith('finalize_individual_subscription', expect.objectContaining({
      p_user_id: 'user-9',
      p_email: 'ada@example.com',
      p_first_name: 'Ada',
      p_last_name: 'Lovelace',
      p_stripe_customer_id: 'cus_1',
      p_stripe_subscription_id: 'sub_1',
      p_activate: false,
    }))
    expect(result.body.clientSecret).toBe('secret_1')
  })

  it('cancels the Stripe subscription when the DB finalize step hits the active-subscription constraint', async () => {
    createUser.mockResolvedValueOnce({ data: { user: { id: 'user-10' } }, error: null })
    rpc.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint "idx_subscriptions_active_user_unique"' },
    })
    global.fetch
      .mockImplementationOnce(() => stripeResponse({ id: 'cus_2' }))
      .mockImplementationOnce(() => stripeResponse({ id: 'pm_2' }))
      .mockImplementationOnce(() => stripeResponse({ id: 'cus_2' }))
      .mockImplementationOnce(() => stripeResponse({
        id: 'sub_2',
        status: 'incomplete',
        current_period_start: 1,
        current_period_end: 2,
        latest_invoice: { payment_intent: { client_secret: 'secret_2' } },
      }))
      .mockImplementationOnce(() => stripeResponse({ id: 'sub_2', status: 'canceled' }))

    await expect(createSubscription({
      body: { paymentMethodId: 'pm_2', email: 'Ada@Example.com', firstName: 'Ada', lastName: 'Lovelace' },
      authedId: null,
    })).rejects.toMatchObject({ message: 'Active subscription already exists', status: 409 })

    expect(global.fetch).toHaveBeenLastCalledWith(
      'https://api.stripe.com/v1/subscriptions/sub_2',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})
