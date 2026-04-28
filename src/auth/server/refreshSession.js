import { del, getAuthUser, rpc, update } from '@api/_lib/supabase.js'
import { hashRefreshToken } from '@api/_lib/jwt.js'
import { findProfileById, hasActiveSubscription } from './accountRepository.js'
import { reconcileProfileEmail } from './reconcileProfileEmail.js'

export async function rotateRefreshSession(rawToken) {
  if (!rawToken) return { clearCookies: true, body: { error: 'No refresh token' }, status: 401 }

  const tokenHash = hashRefreshToken(rawToken)
  const { data, error } = await rpc('consume_refresh_token', {
    p_token_hash: tokenHash,
    p_now: new Date().toISOString(),
  })
  if (error) {
    return {
      clearCookies: true,
      log: ['error', '[refresh] token consume error:', error],
      body: { error: 'Failed to rotate session' },
      status: 500,
    }
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row || row.status === 'missing') {
    return { clearCookies: true, body: { error: 'Invalid refresh token' }, status: 401 }
  }

  if (row.status === 'replayed') {
    await del('refresh_tokens', `user_id=eq.${row.user_id}`)
    return {
      clearCookies: true,
      log: ['warn', `[refresh] replay detected for user ${row.user_id} — all tokens revoked`],
      body: { error: 'Session invalidated — please sign in again' },
      status: 401,
    }
  }

  if (row.status === 'expired') {
    return { clearCookies: true, body: { error: 'Refresh token expired — please sign in again' }, status: 401 }
  }

  const { profile, error: profileError } = await findProfileById(row.user_id, 'id,email,role,is_active,is_deleted')
  if (profileError) {
    return {
      clearCookies: true,
      log: ['error', '[refresh] profile lookup error:', profileError],
      body: { error: 'Failed to rotate session' },
      status: 500,
    }
  }
  if (!profile || profile.is_deleted) {
    await del('refresh_tokens', `user_id=eq.${row.user_id}`)
    return { clearCookies: true, body: { error: 'User not found' }, status: 401 }
  }

  // Use the same accountActive(profile, hasPaid) predicate as session-mint paths.
  if (!profile.is_active) {
    const { hasPaid, error: subscriptionError } = await hasActiveSubscription(row.user_id)
    if (subscriptionError) {
      return {
        clearCookies: true,
        log: ['error', '[refresh] subscription lookup error:', subscriptionError],
        body: { error: 'Failed to rotate session' },
        status: 500,
      }
    }
    if (!hasPaid) {
      await del('refresh_tokens', `user_id=eq.${row.user_id}`)
      return { clearCookies: true, body: { error: 'User not found' }, status: 401 }
    }
  }

  const { id: userId, role } = profile

  // Repair auth↔profile email drift on each rotation so the minted JWT
  // always carries the canonical email even if a prior PATCH partially failed.
  let email = profile.email
  const { data: authUserData } = await getAuthUser(userId)
  const authEmail = authUserData?.user?.email ?? authUserData?.email ?? ''
  if (authEmail) {
    const reconciled = await reconcileProfileEmail({ userId, profileEmail: email, authEmail })
    if (reconciled.error) console.error('[refresh] reconcile email error:', reconciled.error)
    else email = reconciled.email || email
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
