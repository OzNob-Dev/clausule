/**
 * POST /api/auth/register
 *
 * Creates or updates a user profile, activates the fixed individual rollout plan,
 * and immediately issues JWT session cookies.
 *
 * This rollout does not collect card details from the UI.
 * Replace with /api/payments/subscribe when live checkout is re-enabled.
 *
 * Body:   { email: string, firstName: string, lastName?: string, verificationToken: string, subscription: { amountCents: number, currency: string, interval: string } }
 * 200:    { ok: true, role: string }
 * 400:    { error: string }
 * 500:    { error: string }
 */

import { NextResponse }                     from 'next/server'
import { registerOperationKey, registerOperationType } from '@auth/server/backendOperation.js'
import { issueRecoverableSession }          from '@auth/server/recoverableSession.js'
import { registerAccount }                  from '@signup/server/registerAccount.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  try {
    const result = await registerAccount(body)
    if (result.log) console.error(...result.log)
    if (!result.session) return NextResponse.json(result.body, { status: result.status })
    const response = await issueRecoverableSession({
      operationKey: registerOperationKey({ email: body.email }),
      operationType: registerOperationType(),
      email: result.session.email,
      userId: result.session.userId,
      body: result.body,
      status: result.status,
      session: result.session,
      failureMessage: 'Failed to create session',
    })
    return response
  } catch (err) {
    console.error('[register] error:', err)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
