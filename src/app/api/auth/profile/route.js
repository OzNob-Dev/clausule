/**
 * GET /api/auth/profile
 *
 * Returns the authenticated user's profile fields.
 * Response 200: { firstName, lastName, email }
 */

import { NextResponse }              from 'next/server'
import { requireAuth, unauthorized } from '@api/_lib/auth.js'
import { select }                    from '@api/_lib/supabase.js'

export async function GET(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const { data: rows, error } = await select(
    'profiles',
    `id=eq.${userId}&select=first_name,last_name,email&limit=1`
  )

  if (error) {
    console.error('[auth/profile GET]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }

  const row = rows?.[0]
  return NextResponse.json({
    firstName: row?.first_name ?? '',
    lastName:  row?.last_name  ?? '',
    email:     row?.email      ?? '',
  })
}
