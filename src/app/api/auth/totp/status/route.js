/**
 * GET /api/auth/totp/status
 *
 * Returns whether the authenticated user has TOTP configured.
 * Response 200: { configured: boolean }
 */

import { NextResponse }               from 'next/server'
import { authErrorResponse, requireActiveAuth }  from '@api/_lib/auth.js'
import { select }                     from '@api/_lib/supabase.js'

export async function GET(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const { data: rows, error } = await select(
    'profiles',
    `id=eq.${userId}&select=totp_secret&limit=1`
  )

  if (error) {
    console.error('[totp/status GET]', error)
    return NextResponse.json({ error: 'Failed to fetch TOTP status' }, { status: 500 })
  }

  const configured = Boolean(rows?.[0]?.totp_secret)
  return NextResponse.json({ configured })
}
