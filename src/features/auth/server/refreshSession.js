import { del, select, update } from '@api/_lib/supabase.js'
import { hashRefreshToken } from '@api/_lib/jwt.js'
import { findProfileById } from './accountRepository.js'

export async function rotateRefreshSession(rawToken) {
  if (!rawToken) return { clearCookies: true, body: { error: 'No refresh token' }, status: 401 }

  const tokenHash = hashRefreshToken(rawToken)
  const { data: rows } = await select('refresh_tokens', `token_hash=eq.${tokenHash}&limit=1`)
  const row = rows?.[0]

  if (!row) return { clearCookies: true, body: { error: 'Invalid refresh token' }, status: 401 }

  if (row.used_at) {
    await del('refresh_tokens', `user_id=eq.${row.user_id}`)
    return {
      clearCookies: true,
      log: ['warn', `[refresh] replay detected for user ${row.user_id} — all tokens revoked`],
      body: { error: 'Session invalidated — please sign in again' },
      status: 401,
    }
  }

  if (new Date(row.expires_at) <= new Date()) {
    await update('refresh_tokens', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
    return { clearCookies: true, body: { error: 'Refresh token expired — please sign in again' }, status: 401 }
  }

  const { profile } = await findProfileById(row.user_id, 'id,email,role,is_active,is_deleted')
  if (!profile || !profile.is_active || profile.is_deleted) {
    await del('refresh_tokens', `user_id=eq.${row.user_id}`)
    return { clearCookies: true, body: { error: 'User not found' }, status: 401 }
  }

  const { id: userId, email, role } = profile
  const { error: revokeError } = await update(
    'refresh_tokens',
    `id=eq.${row.id}&used_at=is.null`,
    { used_at: new Date().toISOString() }
  )

  if (revokeError) {
    return {
      clearCookies: true,
      log: ['error', '[refresh] failed to revoke current refresh token:', revokeError],
      body: { error: 'Failed to rotate session' },
      status: 500,
    }
  }

  return {
    body: { ok: true, role },
    status: 200,
    session: { userId, email, role },
  }
}

export async function revokeRefreshSession(rawToken) {
  if (!rawToken) return
  const tokenHash = hashRefreshToken(rawToken)
  await update(
    'refresh_tokens',
    `token_hash=eq.${tokenHash}&used_at=is.null`,
    { used_at: new Date().toISOString() }
  )
}
