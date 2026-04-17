/**
 * DELETE /api/account
 *
 * Permanently deletes the authenticated user's account.
 * The Supabase `ON DELETE CASCADE` rules handle:
 *   profiles → subscriptions, brag_entries, passkeys, team_memberships,
 *              file_notes, manager_narratives
 *
 * Requires the user to confirm their email in the request body as an extra
 * safeguard against accidental or CSRF-driven deletion.
 *
 * Body: { confirmEmail: string }
 * Response 204: no content
 * Response 400: { error: string }
 * Response 401: { error: string }
 */

import { NextResponse }                       from 'next/server'
import { requireAuth, unauthorized,
         clearSessionCookie }                 from '../../_lib/auth.js'
import { select, deleteUser }                 from '../../_lib/supabase.js'

export async function DELETE(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const body         = await request.json().catch(() => ({}))
  const confirmEmail = (body.confirmEmail ?? '').trim().toLowerCase()

  if (!confirmEmail) {
    return NextResponse.json(
      { error: 'Provide confirmEmail matching your account email to confirm deletion' },
      { status: 400 }
    )
  }

  // Verify the supplied email matches the account.
  const { data: profiles } = await select(
    'profiles',
    `id=eq.${userId}&select=email&limit=1`
  )

  const storedEmail = profiles?.[0]?.email?.toLowerCase()
  if (!storedEmail || storedEmail !== confirmEmail) {
    return NextResponse.json({ error: 'Email does not match account' }, { status: 400 })
  }

  // Delete the Supabase Auth user — cascades to the profiles row and all
  // child tables via FK constraints.
  const { error: deleteError } = await deleteUser(userId)

  if (deleteError) {
    console.error('[account DELETE] deleteUser error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  // Clear the session cookie.
  const response = new Response(null, { status: 204 })
  response.headers.set('Set-Cookie', clearSessionCookie())
  return response
}
