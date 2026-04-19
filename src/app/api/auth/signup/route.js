/**
 * POST /api/auth/signup
 *
 * Creates a new Supabase Auth user.  The DB trigger `handle_new_user`
 * automatically creates the matching profiles row.
 *
 * Body: { firstName: string, lastName?: string, email: string }
 * Response 201: { ok: true, userId: string }
 * Response 400: { error: string }
 * Response 409: { error: string }  — email already registered
 */

import { NextResponse }   from 'next/server'
import { createUser }     from '@api/_lib/supabase.js'
import { RateLimiter }    from '@api/_lib/rate-limit.js'
import { validateEmail }  from '@shared/utils/emailValidation'

// 5 signup attempts per hour per IP (crude; refine with real IP parsing for production).
const limiter = new RateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

export async function POST(request) {
  // Basic IP-based rate limit.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed, retryAfterMs } = limiter.check(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many signup requests', retryAfterMs },
      { status: 429 }
    )
  }

  const body      = await request.json().catch(() => ({}))
  const firstName = (body.firstName ?? '').trim()
  const lastName  = (body.lastName  ?? '').trim()
  const email     = (body.email     ?? '').trim().toLowerCase()

  // Validate inputs.
  if (!firstName) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  }

  const validation = validateEmail(email)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { data, error } = await createUser({
    email,
    user_metadata: { first_name: firstName, last_name: lastName || undefined },
  })

  if (error) {
    // Supabase returns "User already registered" for duplicate emails.
    const msg = error.msg ?? error.message ?? ''
    if (msg.toLowerCase().includes('already')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    console.error('[signup] createUser error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, userId: data.id }, { status: 201 })
}
