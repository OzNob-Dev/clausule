import { rpc } from '@api/_lib/supabase.js'

function firstRow(data) {
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}

export async function createSsoAuthState({ state, provider, codeVerifier, redirectOrigin, expiresAt }) {
  return rpc('create_sso_auth_state', {
    p_state: state,
    p_provider: provider,
    p_code_verifier: codeVerifier,
    p_redirect_origin: redirectOrigin,
    p_expires_at: expiresAt,
  }, { expectRows: 'single' })
}

export async function consumeSsoAuthState({ state, provider }) {
  const { data, error } = await rpc('consume_sso_auth_state', {
    p_state: state,
    p_provider: provider,
    p_now: new Date().toISOString(),
  }, { expectRows: 'single' })

  if (error?.code === 'PGRST_NO_ROWS') return { row: null, error: null }
  if (error) return { row: null, error }
  return { row: firstRow(data), error: null }
}
