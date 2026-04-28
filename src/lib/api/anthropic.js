import { fetchWithTimeout } from '@api/_lib/network.js'

const MAX_EMPLOYEE_NAME_LENGTH = 120
const MAX_ENTRIES = 30
const MAX_FIELD_LENGTH = 1000

function clean(value) {
  return String(value ?? '').trim()
}

function validateEntries(entries) {
  if (!Array.isArray(entries) || entries.length > MAX_ENTRIES) return null
  return entries.map((entry) => ({
    cat: clean(entry?.cat).slice(0, MAX_FIELD_LENGTH),
    title: clean(entry?.title).slice(0, MAX_FIELD_LENGTH),
    body: clean(entry?.body).slice(0, MAX_FIELD_LENGTH),
  })).filter((entry) => entry.title || entry.body)
}

export async function draftSummaryText({ employeeName, entries }) {
  const name = clean(employeeName)
  const validEntries = validateEntries(entries)
  if (!name || name.length > MAX_EMPLOYEE_NAME_LENGTH || !validEntries?.length) throw new Error('employeeName and entries required')
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('AI service not configured')

  const entryText = validEntries
    .map((entry) => `- [${entry.cat || 'note'}] ${entry.title}: ${entry.body}`)
    .join('\n')

  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Write a concise 2-3 sentence manager summary for ${name} based on these file notes:\n\n${entryText}\n\nBe factual, balanced, and professional. No bullet points.`,
      }],
    }),
  }, { timeoutMs: 10_000, timeoutLabel: 'Anthropic summary draft' })

  if (!res.ok) throw new Error('AI request failed')
  const data = await res.json()
  const text = data?.content?.[0]?.text
  if (!text) throw new Error('AI request failed')
  return text
}
