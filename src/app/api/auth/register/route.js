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
import { select, upsert,
         createUser }                       from '@api/_lib/supabase.js'

export async function POST(request) {
  const body      = await request.json().catch(() => ({}))
  const email     = (body.email     ?? '').trim().toLowerCase()
  const firstName = (body.firstName ?? '').trim()
  const lastName  = (body.lastName  ?? '').trim()

  if (!email)     return NextResponse.json({ error: 'email is required' },     { status: 400 })
  if (!firstName) return NextResponse.json({ error: 'firstName is required' }, { status: 400 })

  try {
    // ── Resolve userId ──────────────────────────────────────────────────────
    let userId

    const { data: profiles } = await select(
      'profiles',
      new URLSearchParams({ email: `eq.${email}`, select: 'id', limit: '1' }).toString()
    )

    if (profiles?.length) {
      userId = profiles[0].id
    } else {
      const { data: created, error: createErr } = await createUser({
        email,
        user_metadata: { first_name: firstName, last_name: lastName || undefined },
      })
      if (createErr) {
        console.error('[register] createUser error:', createErr)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
      userId = created.id
    }

    // ── Save / update profile ───────────────────────────────────────────────
    const { data: upserted } = await upsert('profiles', {
      id:         userId,
      email,
      first_name: firstName,
      last_name:  lastName || null,
    })

    const role = (Array.isArray(upserted) ? upserted[0]?.role : upserted?.role) ?? 'employee'

    const response = NextResponse.json({ ok: true, role })
    const session = await createPersistentSession({ userId, email, role })
    return appendSessionCookies(response, session)
  } catch (err) {
    console.error('[register] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
