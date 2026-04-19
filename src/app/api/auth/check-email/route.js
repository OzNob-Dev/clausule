/**
 * POST /api/auth/check-email
 *
 * Returns whether an email address has a registered account and whether
 * that account has TOTP configured — used by the sign-in page to route
 * the user to the correct MFA step.
 *
 * Body:     { email: string }
 * Response: { exists: boolean, hasMfa: boolean, hasSso: boolean, ssoProvider: string | null }
 */

import { NextResponse }   from 'next/server'
import { getAuthUser,
         select }         from '@api/_lib/supabase.js'
import { RateLimiter }    from '@api/_lib/rate-limit.js'
import { validateEmail }  from '@/utils/emailValidation'

// 20 checks per minute per IP — enough for normal use, tight for enumeration.
const limiter = new RateLimiter({ limit: 20, windowMs: 60 * 1000 })

function ssoProvider(user) {
  const provider = user?.app_metadata?.provider
  if (provider && provider !== 'email') return provider
  return user?.identities?.find((identity) => identity?.provider && identity.provider !== 'email')?.provider ?? null
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = limiter.check(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body  = await request.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()

  const validation = validateEmail(email)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { data } = await select('profiles', `email=eq.${email}&select=id,totp_secret&limit=1`)

  const exists = Array.isArray(data) && data.length > 0
  const hasMfa = exists && Boolean(data[0]?.totp_secret)
  const { data: authUser } = exists ? await getAuthUser(data[0].id) : { data: null }
  const provider = ssoProvider(authUser?.user ?? authUser)

  return NextResponse.json({ exists, hasMfa, hasSso: Boolean(provider), ssoProvider: provider })
}
