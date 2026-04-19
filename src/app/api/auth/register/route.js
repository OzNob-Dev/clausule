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
import { appendSessionCookies,
         createPersistentSession }          from '@api/_lib/session.js'
import { registerAccount }                  from '@features/signup/server/registerAccount.js'

export async function POST(request) {
  try {
    const result = await registerAccount(await request.json().catch(() => ({})))
    if (result.log) console.error(...result.log)
    if (!result.session) return NextResponse.json(result.body, { status: result.status })

    const response = NextResponse.json(result.body)
    const session = await createPersistentSession(result.session)
    return appendSessionCookies(response, session)
  } catch (err) {
    console.error('[register] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
