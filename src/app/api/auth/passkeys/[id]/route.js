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
import { select, del }                from '@api/_lib/supabase.js'

export async function DELETE(request, { params }) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const deviceId = params.id
  const ownedDeviceQuery = new URLSearchParams({
    id: `eq.${deviceId}`,
    user_id: `eq.${userId}`,
    limit: '1',
  }).toString()

  // Confirm the device exists and belongs to this user.
  const { data: rows } = await select(
    'passkeys',
    ownedDeviceQuery
  )

  if (!rows?.length) {
    return NextResponse.json({ error: 'Device not found' }, { status: 404 })
  }

  // Count remaining devices.
  const { data: allDevices } = await select(
    'passkeys',
    new URLSearchParams({ user_id: `eq.${userId}`, select: 'id' }).toString()
  )

  if ((allDevices?.length ?? 0) <= 1) {
    return NextResponse.json(
      { error: 'Cannot remove your only registered device' },
      { status: 400 }
    )
  }

  const { error } = await del('passkeys', new URLSearchParams({
    id: `eq.${deviceId}`,
    user_id: `eq.${userId}`,
  }).toString())

  if (error) {
    console.error('[passkeys/[id] DELETE]', error)
    return NextResponse.json({ error: 'Failed to remove device' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
