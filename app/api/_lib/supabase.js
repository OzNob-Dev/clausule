/**
 * Supabase admin client using the service role key.
 * Only call from server-side API routes — never expose SUPABASE_SERVICE_ROLE_KEY
 * to the browser.
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  // Warn at startup rather than throwing — lets build succeed without secrets.
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
}

/**
 * Execute a PostgREST query against Supabase.
 * @param {string} path - e.g. '/rest/v1/otp_codes'
 * @param {RequestInit} init - fetch options
 * @returns {Promise<{ data: any, error: any }>}
 */
async function supaFetch(path, init = {}) {
  const url = `${SUPABASE_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=representation',
      ...init.headers,
    },
  })

  if (res.status === 204) return { data: null, error: null }

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    return { data: null, error: payload ?? { message: `HTTP ${res.status}` } }
  }

  return { data: payload, error: null }
}

// ── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Insert a row and return the created record.
 */
export function insert(table, body) {
  return supaFetch(`/rest/v1/${table}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Select rows.  `query` is a URLSearchParams-compatible string, e.g.
 * "email=eq.foo@bar.com&used_at=is.null&expires_at=gt.now()"
 */
export function select(table, query = '') {
  return supaFetch(`/rest/v1/${table}?${query}`)
}

/**
 * Update rows matching query.
 */
export function update(table, query, body) {
  return supaFetch(`/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/**
 * Delete rows matching query.
 */
export function del(table, query) {
  return supaFetch(`/rest/v1/${table}?${query}`, { method: 'DELETE' })
}

// ── Supabase Auth Admin endpoints ────────────────────────────────────────────

/**
 * Create a new user via the Supabase Admin auth API.
 * @param {{ email: string, password?: string, user_metadata?: object }} opts
 */
export function createUser({ email, password, user_metadata }) {
  return supaFetch('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: password ?? undefined,
      email_confirm: true,
      user_metadata: user_metadata ?? {},
    }),
  })
}

/**
 * Delete a user account (and all cascaded rows via DB triggers).
 * @param {string} userId - UUID
 */
export function deleteUser(userId) {
  return supaFetch(`/auth/v1/admin/users/${userId}`, { method: 'DELETE' })
}
