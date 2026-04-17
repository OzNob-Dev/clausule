/**
 * Client-side API utilities.
 * Heavy/secret work runs through server routes — no API keys in this file.
 */

/**
 * Request an AI-drafted manager summary via the server-side proxy.
 * @param {string} employeeName
 * @param {Array<{ cat: string, title: string, body: string }>} entries
 * @returns {Promise<string>} summary text
 */
export async function draftSummary(employeeName, entries) {
  const res = await fetch('/api/ai/draft-summary', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ employeeName, entries }),
  })

  if (!res.ok) throw new Error('API request failed')
  const data = await res.json()
  return data.text
}
