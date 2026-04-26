/**
 * POST /api/ai/draft-summary
 *
 * Server-side proxy for Anthropic AI summary drafting.
 * Keeps ANTHROPIC_API_KEY out of client bundles.
 *
 * Body:     { employeeName: string, entries: Array<{ cat: string, title: string, body: string }> }
 * Response: { text: string }
 */

import { NextResponse }              from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { fetchWithTimeout } from '@api/_lib/network.js'
import { consumeDistributedRateLimit } from '@features/auth/server/distributedRateLimit.js'
const MAX_EMPLOYEE_NAME_LENGTH = 120
const MAX_ENTRIES = 30
const MAX_FIELD_LENGTH = 1000

function clean(value) {
  return String(value ?? '').trim()
}

function safeProviderError(payload) {
  return {
    type: clean(payload?.type).slice(0, 80) || 'unknown',
    code: clean(payload?.error?.type ?? payload?.error?.code).slice(0, 80) || 'unknown',
  }
}

function safeResponseShape(payload) {
  return {
    keys: payload && typeof payload === 'object' ? Object.keys(payload).slice(0, 10) : [],
    contentItems: Array.isArray(payload?.content) ? payload.content.length : 0,
  }
}

function validateEntries(entries) {
  if (!Array.isArray(entries) || entries.length > MAX_ENTRIES) return null
  return entries.map((entry) => ({
    cat: clean(entry?.cat).slice(0, MAX_FIELD_LENGTH),
    title: clean(entry?.title).slice(0, MAX_FIELD_LENGTH),
    body: clean(entry?.body).slice(0, MAX_FIELD_LENGTH),
  })).filter((entry) => entry.title || entry.body)
}

export async function POST(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)
  const { allowed, retryAfterMs, error: limitError } = await consumeDistributedRateLimit({
    scope: 'ai_draft_summary_user',
    identifier: userId,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
  if (limitError) {
    console.error('[draft-summary] rate limit error:', limitError)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }

  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests', retryAfterMs }, { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } })
  }

  const body = await request.json().catch(() => ({}))
  const employeeName = clean(body.employeeName)
  const entries = validateEntries(body.entries)

  if (!employeeName || employeeName.length > MAX_EMPLOYEE_NAME_LENGTH || !entries?.length) {
    return NextResponse.json({ error: 'employeeName and entries required' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const entryText = entries
    .map((e) => `- [${e.cat || 'note'}] ${e.title}: ${e.body}`)
    .join('\n')

  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [
        {
          role:    'user',
          content: `Write a concise 2-3 sentence manager summary for ${employeeName} based on these file notes:\n\n${entryText}\n\nBe factual, balanced, and professional. No bullet points.`,
        },
      ],
    }),
  }, { timeoutMs: 10_000, timeoutLabel: 'Anthropic summary draft' })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[draft-summary] Anthropic error:', { status: res.status, ...safeProviderError(err) })
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text
  if (!text) {
    console.error('[draft-summary] unexpected Anthropic response shape:', safeResponseShape(data))
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
  }
  return NextResponse.json({ text })
}
