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
import { requireActiveAuth }                      from '@api/_lib/auth.js'
import { createSubscription,
         paymentSystemConfigured }          from '@features/payments/server/createSubscription.js'
import { issueRecoverableSession }          from '@features/auth/server/recoverableSession.js'
import { subscribeOperationKey, subscribeOperationType } from '@features/auth/server/backendOperation.js'

export async function POST(request) {
  if (!paymentSystemConfigured()) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
  }

  const { userId: authedId, email: authedEmail, error: authError } = await requireActiveAuth(request)
  const body = await request.json().catch(() => ({}))

  try {
    const result = await createSubscription({
      body,
      authedId: authError ? null : authedId,
      authEmail: authError ? null : authedEmail,
    })
    if (!result.session) return NextResponse.json(result.body, { status: result.status })
    return issueRecoverableSession({
      operationKey: subscribeOperationKey({ authedId: authError ? null : authedId, email: body.email, paymentMethodId: body.paymentMethodId }),
      operationType: subscribeOperationType(),
      email: result.session.email,
      userId: result.session.userId,
      body: result.body,
      status: result.status,
      session: result.session,
      failureMessage: 'Failed to create session',
    })
  } catch (err) {
    if (err.log) console.error(...err.log)
    console.error('[subscribe] error:', err)
    if (err.status === 409) return NextResponse.json({ error: 'Active subscription already exists' }, { status: 409 })
    if (err.status === 403) return NextResponse.json({ error: err.message, nextStep: err.nextStep ?? null }, { status: 403 })
    if (err.status === 400) return NextResponse.json({ error: 'Invalid subscription request' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
