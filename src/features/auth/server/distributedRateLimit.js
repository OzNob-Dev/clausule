import { rpc } from '@api/_lib/supabase.js'

function firstRow(data) {
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}

export async function consumeDistributedRateLimit({ scope, identifier, limit, windowMs }) {
  const { data, error } = await rpc('consume_rate_limit', {
    p_scope: scope,
    p_identifier: String(identifier ?? ''),
    p_limit: limit,
    p_window_ms: windowMs,
    p_now: new Date().toISOString(),
  }, { expectRows: 'single' })

  if (error) return { error }

  const row = firstRow(data)
  return {
    allowed: row?.allowed === true,
    retryAfterMs: Number(row?.retry_after_ms ?? 0),
    error: null,
  }
}
