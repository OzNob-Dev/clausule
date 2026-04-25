/**
 * /api/brag/entries/[id]
 *
 * GET, PUT, and DELETE a single owned brag entry.
 */

import { NextResponse } from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { deleteEntry, getEntry, updateEntry } from '@features/brag/server/entries.js'

export async function GET(request, { params }) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)
  const { id: entryId } = await params

  const result = await getEntry({ userId, entryId })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}

export async function PUT(request, { params }) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)
  const { id: entryId } = await params

  const result = await updateEntry({ userId, entryId, body: await request.json().catch(() => ({})) })
  if (result.log) console.error(...result.log)
  return NextResponse.json(result.body, { status: result.status })
}

export async function DELETE(request, { params }) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)
  const { id: entryId } = await params

  const result = await deleteEntry({ userId, entryId })
  if (result.log) console.error(...result.log)
  return result.status === 204 ? new Response(null, { status: 204 }) : NextResponse.json(result.body, { status: result.status })
}
