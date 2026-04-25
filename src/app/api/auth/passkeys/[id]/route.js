/**
 * DELETE /api/auth/passkeys/[id]
 *
 * Removes a registered passkey device from the authenticated user's account.
 * Prevents removal of the last device so the user isn't locked out.
 *
 * Response 204: no content
 * Response 400: { error: string }  — last device or bad id
 * Response 404: { error: string }
 */

import { NextResponse }               from 'next/server'
import { authErrorResponse, requireActiveAuth }  from '@api/_lib/auth.js'
import { rpc }                        from '@api/_lib/supabase.js'

export async function DELETE(request, { params }) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)
  const { id: deviceId } = await params

  const { data, error } = await rpc('delete_passkey_device', {
    p_user_id: userId,
    p_passkey_id: deviceId,
  }, { expectRows: 'single' })

  if (error) {
    console.error('[passkeys/[id] DELETE]', error)
    return NextResponse.json({ error: 'Failed to remove device' }, { status: 500 })
  }

  const row = Array.isArray(data) ? data[0] ?? null : data ?? null
  if (row?.status === 'not_found') return NextResponse.json({ error: 'Device not found' }, { status: 404 })
  if (row?.status === 'last_device') {
    return NextResponse.json({ error: 'Cannot remove your only registered device' }, { status: 400 })
  }
  if (row?.status !== 'deleted') {
    console.error('[passkeys/[id] DELETE] unexpected rpc status:', row?.status)
    return NextResponse.json({ error: 'Failed to remove device' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
