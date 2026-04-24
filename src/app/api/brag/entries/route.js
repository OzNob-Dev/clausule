/**
 * /api/brag/entries
 *
 * GET lists entries. POST creates an entry.
 */

import { NextResponse } from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { createEntry, listEntries } from '@features/brag/server/entries.js'

export async function GET(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const result = await listEntries({ userId, searchParams: new URL(request.url).searchParams })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const result = await createEntry({ userId, body: await request.json().catch(() => ({})) })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}
