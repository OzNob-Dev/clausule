/**
 * POST /api/auth/register
 *
 * Lightweight registration endpoint — no payment required.
 * Creates or updates a user profile and immediately issues JWT session cookies.
 *
 * Temporary: replaces the Stripe subscribe flow while payment is disabled.
 * Replace with /api/payments/subscribe when Stripe is re-enabled.
 *
 * Body:   { email: string, firstName: string, lastName?: string }
 * 200:    { ok: true, role: string }
 * 400:    { error: string }
 * 500:    { error: string }
 */

import { NextResponse }                     from 'next/server'
import { registerOperationKey, registerOperationType } from '@features/auth/server/backendOperation.js'
import { issueRecoverableSession }          from '@features/auth/server/recoverableSession.js'
import { registerAccount }                  from '@features/signup/server/registerAccount.js'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  try {
    const result = await registerAccount(body)
    if (result.log) console.error(...result.log)
    if (!result.session) return NextResponse.json(result.body, { status: result.status })
    return issueRecoverableSession({
      operationKey: registerOperationKey({ email: body.email }),
      operationType: registerOperationType(),
      email: result.session.email,
      userId: result.session.userId,
      body: result.body,
      status: result.status,
      session: result.session,
      failureMessage: 'Failed to create session',
    })
  } catch (err) {
    console.error('[register] error:', err)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
