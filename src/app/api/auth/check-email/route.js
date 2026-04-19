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

function profileQuery(email) {
  return new URLSearchParams({ email: `ilike.${email}`, select: 'id,totp_secret,is_active,is_deleted', limit: '1' }).toString()
}

function paidQuery(userId) {
  return new URLSearchParams({
    user_id: `eq.${userId}`,
    status: 'in.(active,trialing)',
    select: 'id',
    limit: '1',
  }).toString()
}

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

  const { data, error } = await select('profiles', profileQuery(email))
  if (error) {
    console.error('[check-email] profile lookup failed:', error)
    return NextResponse.json({ error: 'Email check failed' }, { status: 500 })
  }

  const exists = Array.isArray(data) && data.length > 0
  if (!exists) {
    return NextResponse.json({ exists: false, isActive: false, isDeleted: false, hasMfa: false, hasSso: false, ssoProvider: null, hasPaid: false })
  }

  const profile = data[0]
  const { data: paidRows, error: paidError } = await select('subscriptions', paidQuery(profile.id))
  if (paidError) {
    console.error('[check-email] subscription lookup failed:', paidError)
    return NextResponse.json({ error: 'Email check failed' }, { status: 500 })
  }

  const hasPaid = Array.isArray(paidRows) && paidRows.length > 0
  const isDeleted = Boolean(profile.is_deleted)
  const isActive = Boolean(profile.is_active) || hasPaid
  const hasMfa = exists && Boolean(profile.totp_secret)
  const { data: authUser, error: authError } = await getAuthUser(profile.id)
  if (authError) {
    console.error('[check-email] auth user lookup failed:', authError)
    return NextResponse.json({ error: 'Email check failed' }, { status: 500 })
  }
  const provider = ssoProvider(authUser?.user ?? authUser)
  return NextResponse.json({ exists, isActive, isDeleted, hasMfa, hasSso: Boolean(provider), ssoProvider: provider, hasPaid })
}
