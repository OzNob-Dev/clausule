/**
 * Client-side API utilities.
 * Heavy/secret work runs through server routes — no API keys in this file.
 */

export async function apiFetch(input, init = {}, options = {}) {
  const { retryOnUnauthorized = true } = options
  const requestInit = { credentials: 'same-origin', ...init }
  let res = await fetch(input, requestInit)

  if (res.status !== 401 || !retryOnUnauthorized) return res

  const refresh = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'same-origin',
  })

  if (!refresh.ok) return res
  return fetch(input, requestInit)
}

export async function readJson(response, fallback = {}) {
  return response.json().catch(() => fallback)
}

export async function apiJson(input, init = {}, options = {}) {
  const response = await apiFetch(input, init, options)
  const data = await readJson(response, {})

  if (!response.ok) {
    const error = new Error(data.error ?? 'API request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export function jsonRequest(body, init = {}) {
  return {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
    body: JSON.stringify(body),
  }
}

/**
 * Request an AI-drafted manager summary via the server-side proxy.
 * @param {string} employeeName
 * @param {Array<{ cat: string, title: string, body: string }>} entries
 * @returns {Promise<string>} summary text
 */
export async function draftSummary(employeeName, entries) {
  const data = await apiJson('/api/ai/draft-summary', jsonRequest({ employeeName, entries }, { method: 'POST' }))
  return data.text
}
