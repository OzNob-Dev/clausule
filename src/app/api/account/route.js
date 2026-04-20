/**
 * DELETE /api/account
 *
 * Soft-deletes the authenticated user's account.
 *
 * Response 204: no content
 * Response 401: { error: string }
 */

import { NextResponse }                       from 'next/server'
import { requireAuth, unauthorized,
         clearAuthCookies }                   from '@api/_lib/auth.js'
import { del, update }                        from '@api/_lib/supabase.js'

export async function DELETE(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const deletedAt = new Date().toISOString()
  const { error: deleteError } = await update('profiles', `id=eq.${userId}`, {
    is_active: false,
    is_deleted: true,
    deleted_at: deletedAt,
  })

  if (deleteError) {
    console.error('[account DELETE] profile soft-delete error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  await del('refresh_tokens', `user_id=eq.${userId}`).catch((err) => {
    console.warn('[account DELETE] failed to revoke refresh tokens:', err?.message)
  })

  const response = new Response(null, { status: 204 })
  clearAuthCookies().forEach((c) => response.headers.append('Set-Cookie', c))
  return response
}
