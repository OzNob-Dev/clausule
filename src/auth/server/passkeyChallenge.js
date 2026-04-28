import { rpc } from '@api/_lib/supabase.js'

function firstRow(data) {
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}

export async function storePasskeyChallenge({ userId, challenge, expiresAt }) {
  return rpc('store_passkey_challenge', {
    p_user_id: userId,
    p_challenge: challenge,
    p_expires_at: expiresAt,
  }, { expectRows: 'single' })
}

export async function consumePasskeyChallenge({ userId, challenge }) {
  const { data, error } = await rpc('consume_passkey_challenge', {
    p_user_id: userId,
    p_challenge: challenge,
    p_now: new Date().toISOString(),
  }, { expectRows: 'single' })

  if (error?.code === 'PGRST_NO_ROWS') return { row: null, error: null }
  if (error) return { row: null, error }
  return { row: firstRow(data), error: null }
}

export async function storePasskeyAuthChallenge({ challenge, expiresAt }) {
  return rpc('store_passkey_auth_challenge', {
    p_challenge: challenge,
    p_expires_at: expiresAt,
  }, { expectRows: 'single' })
}

export async function consumePasskeyAuthChallenge({ challenge }) {
  const { data, error } = await rpc('consume_passkey_auth_challenge', {
    p_challenge: challenge,
    p_now: new Date().toISOString(),
  }, { expectRows: 'single' })

  if (error?.code === 'PGRST_NO_ROWS') return { row: null, error: null }
  if (error) return { row: null, error }
  return { row: firstRow(data), error: null }
}
