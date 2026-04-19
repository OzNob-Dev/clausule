import { insert, select, upsert, createUser } from '@api/_lib/supabase.js'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_API = 'https://api.stripe.com/v1'
const PLAN_AMOUNT_CENTS = 500
const PLAN_CURRENCY = 'usd'

async function stripe(path, body = null, method = 'POST') {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? body.toString() : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? `Stripe HTTP ${res.status}`)
  return data
}

async function resolveUserId({ authedId, email, firstName, lastName }) {
  if (authedId) return authedId

  const { data: profiles } = await select(
    'profiles',
    new URLSearchParams({ email: `eq.${email}`, select: 'id', limit: '1' }).toString()
  )
  if (profiles?.length) return profiles[0].id

  const { data: created, error: createErr } = await createUser({
    email,
    user_metadata: { first_name: firstName, last_name: lastName || undefined },
  })
  if (createErr) throw Object.assign(new Error('Failed to create user account'), { status: 500, log: ['[subscribe] createUser error:', createErr] })
  return created.id
}

export function paymentSystemConfigured() {
  return Boolean(STRIPE_KEY)
}

export async function createSubscription({ body, authedId }) {
  const paymentMethodId = (body.paymentMethodId ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const firstName = (body.firstName ?? '').trim()
  const lastName = (body.lastName ?? '').trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  if (!paymentMethodId || !email) return { body: { error: 'paymentMethodId and email are required' }, status: 400 }
  if (!firstName) return { body: { error: 'firstName is required' }, status: 400 }

  const userId = await resolveUserId({ authedId, email, firstName, lastName })

  const { data: existing } = await select('subscriptions', `user_id=eq.${userId}&status=in.(active,trialing)&limit=1`)
  if (existing?.length) return { body: { error: 'Active subscription already exists' }, status: 409 }

  const customer = await stripe('/customers', new URLSearchParams({ email, name: fullName }))

  await stripe(`/payment_methods/${paymentMethodId}/attach`, new URLSearchParams({ customer: customer.id }))

  await stripe(
    `/customers/${customer.id}`,
    new URLSearchParams({ 'invoice_settings[default_payment_method]': paymentMethodId })
  )

  const subscription = await stripe('/subscriptions', new URLSearchParams({
    customer: customer.id,
    'items[0][price_data][currency]': PLAN_CURRENCY,
    'items[0][price_data][product_data][name]': 'Clausule Individual',
    'items[0][price_data][unit_amount]': String(PLAN_AMOUNT_CENTS),
    'items[0][price_data][recurring][interval]': 'month',
    payment_behavior: 'default_incomplete',
    'expand[]': 'latest_invoice.payment_intent',
  }))

  await insert('subscriptions', {
    user_id: userId,
    stripe_customer_id: customer.id,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    plan: 'individual',
    amount_cents: PLAN_AMOUNT_CENTS,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  })

  const { data: upserted } = await upsert('profiles', {
    id: userId,
    email,
    first_name: firstName,
    last_name: lastName || null,
  })

  const role = (Array.isArray(upserted) ? upserted[0]?.role : upserted?.role) ?? 'employee'
  const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret ?? null

  return {
    body: { ok: true, subscriptionId: subscription.id, clientSecret, role },
    status: 200,
    session: { userId, email, role },
  }
}
