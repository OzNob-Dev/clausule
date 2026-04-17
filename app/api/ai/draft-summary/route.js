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
import { requireAuth, unauthorized } from '@api/_lib/auth.js'

export async function POST(request) {
  const { error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const body = await request.json().catch(() => ({}))
  const { employeeName, entries } = body

  if (!employeeName || !Array.isArray(entries)) {
    return NextResponse.json({ error: 'employeeName and entries required' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const entryText = entries
    .map((e) => `- [${e.cat}] ${e.title}: ${e.body}`)
    .join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
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
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[draft-summary] Anthropic error:', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ text: data.content[0].text })
}
