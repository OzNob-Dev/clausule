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
  const res = await apiFetch('/api/ai/draft-summary', jsonRequest({ employeeName, entries }, { method: 'POST' }))

  if (!res.ok) throw new Error('API request failed')
  const data = await res.json()
  return data.text
}
