/**
 * GET /api/auth/passkeys
 *
 * Returns all passkey devices registered to the authenticated user.
 * Response 200: [{ id, name, type, method, addedAt, isCurrent }]
 */

import { NextResponse }               from 'next/server'
import { requireAuth, unauthorized }  from '@api/_lib/auth.js'
import { select }                     from '@api/_lib/supabase.js'

export async function GET(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const { data: rows, error } = await select(
    'passkeys',
    `user_id=eq.${userId}&select=id,name,type,method,added_at,is_current&order=added_at.asc`
  )

  if (error) {
    console.error('[passkeys GET]', error)
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }

  const devices = (rows ?? []).map((r) => ({
    id:        r.id,
    name:      r.name,
    type:      r.type,
    method:    r.method,
    addedAt:   r.added_at,
    isCurrent: r.is_current,
  }))

  return NextResponse.json(devices)
}
