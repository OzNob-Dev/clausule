/**
 * POST /api/payments/subscribe
 *
 * Creates a Stripe customer and an individual plan subscription.
 * Expects the frontend to use Stripe.js to tokenize the card (PaymentMethod ID),
 * NOT raw card numbers.  See: https://stripe.com/docs/payments/accept-a-payment
 *
 * Supports two call contexts:
 *   - Authenticated (JWT cookie present): userId is taken from the token.
 *   - Signup (no JWT): email + firstName + lastName are used to look up or create
 *     the user — enables payment before the first OTP/MFA step.
 *
 * On success, issues httpOnly JWT access + refresh token cookies so the user
 * is immediately authenticated without a separate OTP step.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   JWT_SECRET
 *
 * Body: { paymentMethodId: string, email: string, firstName: string, lastName?: string }
 * Response 200: { ok: true, subscriptionId: string, clientSecret: string, role: string }
 * Response 400: { error: string }
 */

import { NextResponse }                     from 'next/server'
import { requireAuth }                      from '@api/_lib/auth.js'
import { appendSessionCookies,
         createPersistentSession }          from '@api/_lib/session.js'
import { insert, select, upsert,
         createUser }                       from '@api/_lib/supabase.js'

const STRIPE_KEY        = process.env.STRIPE_SECRET_KEY
const STRIPE_API        = 'https://api.stripe.com/v1'
const PLAN_AMOUNT_CENTS = 500   // $5.00
const PLAN_CURRENCY     = 'usd'

/**
 * Minimal Stripe API wrapper using fetch (no stripe SDK needed).
 * @param {string} path
 * @param {URLSearchParams|null} body
 * @param {'POST'|'GET'} method
 */
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

export async function POST(request) {
  if (!STRIPE_KEY) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
  }

  const body            = await request.json().catch(() => ({}))
  const paymentMethodId = (body.paymentMethodId ?? '').trim()
  const email           = (body.email     ?? '').trim().toLowerCase()
  const firstName       = (body.firstName ?? '').trim()
  const lastName        = (body.lastName  ?? '').trim()
  const fullName        = [firstName, lastName].filter(Boolean).join(' ')

  if (!paymentMethodId || !email) {
    return NextResponse.json({ error: 'paymentMethodId and email are required' }, { status: 400 })
  }
  if (!firstName) {
    return NextResponse.json({ error: 'firstName is required' }, { status: 400 })
  }

  // ── Resolve userId ─────────────────────────────────────────────────────────
  // Use the JWT session when present (authenticated upgrade path).
  // Fall back to email lookup / user creation for the initial signup path.
  let userId
  const { userId: authedId, error: authError } = requireAuth(request)

  if (!authError && authedId) {
    userId = authedId
  } else {
    // Signup path: look up an existing user by email.
    const { data: profiles } = await select(
      'profiles',
      new URLSearchParams({ email: `eq.${email}`, select: 'id', limit: '1' }).toString()
    )
    if (profiles?.length) {
      userId = profiles[0].id
    } else {
      // User doesn't exist yet — create them now.
      const { data: created, error: createErr } = await createUser({
        email,
        user_metadata: { first_name: firstName, last_name: lastName || undefined },
      })
      if (createErr) {
        console.error('[subscribe] createUser error:', createErr)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
      userId = created.id
    }
  }

  try {
    // Check for an existing subscription to avoid duplicates.
    const { data: existing } = await select(
      'subscriptions',
      `user_id=eq.${userId}&status=in.(active,trialing)&limit=1`
    )
    if (existing?.length) {
      return NextResponse.json({ error: 'Active subscription already exists' }, { status: 409 })
    }

    // 1. Create Stripe customer.
    const customerParams = new URLSearchParams({ email, name: fullName })
    const customer = await stripe('/customers', customerParams)

    // 2. Attach the payment method to the customer.
    await stripe(
      `/payment_methods/${paymentMethodId}/attach`,
      new URLSearchParams({ customer: customer.id })
    )

    // 3. Set it as the default payment method.
    await stripe(
      `/customers/${customer.id}`,
      new URLSearchParams({
        'invoice_settings[default_payment_method]': paymentMethodId,
      })
    )

    // 4. Create a subscription.
    //    Using price_data for inline price (no pre-existing Stripe Price object needed).
    const subParams = new URLSearchParams({
      customer: customer.id,
      'items[0][price_data][currency]':            PLAN_CURRENCY,
      'items[0][price_data][product_data][name]':  'Clausule Individual',
      'items[0][price_data][unit_amount]':         String(PLAN_AMOUNT_CENTS),
      'items[0][price_data][recurring][interval]': 'month',
      payment_behavior: 'default_incomplete',
      'expand[]':       'latest_invoice.payment_intent',
    })
    const subscription = await stripe('/subscriptions', subParams)

    // 5. Persist to our subscriptions table.
    await insert('subscriptions', {
      user_id:                userId,
      stripe_customer_id:     customer.id,
      stripe_subscription_id: subscription.id,
      status:                 subscription.status,
      plan:                   'individual',
      amount_cents:           PLAN_AMOUNT_CENTS,
      current_period_start:   new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end:     new Date(subscription.current_period_end   * 1000).toISOString(),
    })

    // 6. Store/update the user's profile now that payment is confirmed.
    const { data: upserted } = await upsert('profiles', {
      id:         userId,
      email,
      first_name: firstName,
      last_name:  lastName || null,
    })

    const role = (Array.isArray(upserted) ? upserted[0]?.role : upserted?.role) ?? 'employee'

    const clientSecret =
      subscription.latest_invoice?.payment_intent?.client_secret ?? null

    const response = NextResponse.json({
      ok:             true,
      subscriptionId: subscription.id,
      clientSecret,
      role,
    })
    const session = await createPersistentSession({ userId, email, role })
    return appendSessionCookies(response, session)
  } catch (err) {
    console.error('[subscribe] Stripe error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 402 })
  }
}
