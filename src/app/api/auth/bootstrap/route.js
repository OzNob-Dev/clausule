/**
 * GET /api/auth/bootstrap
 *
 * Returns the authenticated user plus the profile/security fields needed
 * to hydrate the protected app shell in a single request.
 */

import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@api/_lib/auth.js'
import { select } from '@api/_lib/supabase.js'

export async function GET(request) {
  const { userId, email, role, authMethod, error: authError } = requireAuth(request)

  if (authError === 'Token expired') {
    return NextResponse.json({ error: 'Token expired' }, { status: 401 })
  }

  if (authError) {
    return unauthorized(authError)
  }

  const { data: rows, error } = await select(
    'profiles',
    `id=eq.${userId}&select=first_name,last_name,email,totp_secret&limit=1`
  )

  if (error) {
    console.error('[auth/bootstrap GET]', error)
    return NextResponse.json({ error: 'Failed to fetch bootstrap data' }, { status: 500 })
  }

  const row = rows?.[0]

  return NextResponse.json({
    user: {
      id: userId,
      email,
      role,
    },
    profile: {
      firstName: row?.first_name ?? '',
      lastName: row?.last_name ?? '',
      email: row?.email ?? email ?? '',
    },
    security: {
      authenticatorAppConfigured: Boolean(row?.totp_secret),
      authenticatedWithOtp: authMethod === 'otp',
    },
  })
}
