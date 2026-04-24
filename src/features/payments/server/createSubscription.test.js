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

function startedOperation() {
  return {
    data: [{
      status: 'started',
      status_code: 200,
      user_id: null,
      session_email: null,
      session_role: null,
      response_body: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    }],
    error: null,
  }
}

function completedOperation() {
  return {
    data: [{
      status: 'completed',
      status_code: 200,
      user_id: 'user-9',
      session_email: 'ada@example.com',
      session_role: 'employee',
      response_body: { ok: true, subscriptionId: 'sub_1', clientSecret: 'secret_1', role: 'employee' },
      stripe_customer_id: 'cus_1',
      stripe_subscription_id: 'sub_1',
    }],
    error: null,
  }
}

describe('createSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'stripe-key'
    global.fetch = vi.fn()
  })

  it('uses the nested auth user id and finalizes the DB write transactionally', async () => {
    createUser.mockResolvedValueOnce({ data: { user: { id: 'user-9' } }, error: null })
    rpc
      .mockImplementationOnce(async () => startedOperation())
      .mockImplementationOnce(async () => ({ data: [{ role: 'employee' }], error: null }))
      .mockImplementationOnce(async () => completedOperation())
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
    expect(rpc).toHaveBeenCalledWith('begin_backend_operation', expect.objectContaining({
      p_operation_type: 'subscribe',
      p_operation_key: 'subscribe:ada@example.com:individual:usd:500:month',
      p_email: 'ada@example.com',
    }))
    expect(rpc).toHaveBeenCalledWith('finalize_individual_subscription', expect.objectContaining({
      p_user_id: 'user-9',
      p_email: 'ada@example.com',
      p_first_name: 'Ada',
      p_last_name: 'Lovelace',
      p_stripe_customer_id: 'cus_1',
      p_stripe_subscription_id: 'sub_1',
      p_retry_key: 'subscribe:ada@example.com:individual:usd:500:month',
      p_activate: false,
    }))
    expect(rpc).toHaveBeenCalledWith('complete_backend_operation', expect.objectContaining({
      p_operation_type: 'subscribe',
      p_user_id: 'user-9',
      p_response_body: { ok: true, subscriptionId: 'sub_1', clientSecret: 'secret_1', role: 'employee' },
      p_stripe_customer_id: 'cus_1',
      p_stripe_subscription_id: 'sub_1',
    }), { expectRows: 'single' })
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.stripe.com/v1/customers',
      expect.objectContaining({ headers: expect.objectContaining({ 'Idempotency-Key': 'subscribe:ada@example.com:individual:usd:500:month:customer' }) })
    )
    expect(result.body.clientSecret).toBe('secret_1')
  })

  it('cancels the Stripe subscription when the DB finalize step hits the active-subscription constraint', async () => {
    createUser.mockResolvedValueOnce({ data: { user: { id: 'user-10' } }, error: null })
    rpc
      .mockImplementationOnce(async () => startedOperation())
      .mockImplementationOnce(async () => ({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "idx_subscriptions_active_user_unique"' },
      }))
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

  it('reuses a completed subscribe operation without creating new Stripe objects', async () => {
    rpc.mockImplementationOnce(async () => completedOperation())

    const result = await createSubscription({
      body: { paymentMethodId: 'pm_1', email: 'Ada@Example.com', firstName: 'Ada', lastName: 'Lovelace' },
      authedId: null,
    })

    expect(result).toEqual({
      body: { ok: true, subscriptionId: 'sub_1', clientSecret: 'secret_1', role: 'employee' },
      status: 200,
      session: { userId: 'user-9', email: 'ada@example.com', role: 'employee' },
    })
    expect(global.fetch).not.toHaveBeenCalled()
    expect(createUser).not.toHaveBeenCalled()
  })
})
