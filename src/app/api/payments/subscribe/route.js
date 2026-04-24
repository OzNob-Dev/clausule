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
import { createSubscription,
         paymentSystemConfigured }          from '@features/payments/server/createSubscription.js'

export async function POST(request) {
  if (!paymentSystemConfigured()) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
  }

  const { userId: authedId, error: authError } = requireAuth(request)

  try {
    const result = await createSubscription({
      body: await request.json().catch(() => ({})),
      authedId: authError ? null : authedId,
    })
    if (!result.session) return NextResponse.json(result.body, { status: result.status })

    const response = NextResponse.json(result.body)
    const session = await createPersistentSession(result.session)
    return appendSessionCookies(response, session)
  } catch (err) {
    if (err.log) console.error(...err.log)
    console.error('[subscribe] Stripe error:', err.message)
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 })
  }
}
