/**
 * /api/brag/entries
 *
 * GET  — list all brag entries for the authenticated user, newest first.
 *        Query params: ?limit=20&offset=0
 *
 * POST — create a new brag entry.
 *        Body: {
 *          title: string,
 *          body?: string,
 *          entry_date?: string (ISO date, defaults to today),
 *          evidence_types?: Array<'Work artefact'|'Metrics / data'|'Peer recognition'|'External link'>
 *          visible_to_manager?: boolean (default true)
 *        }
 *        Response 201: { ok: true, entry: object }
 */

import { NextResponse }           from 'next/server'
import { requireAuth, unauthorized } from '@api/_lib/auth.js'
import { select, insert }         from '@api/_lib/supabase.js'

const VALID_EVIDENCE_TYPES = new Set([
  'Work artefact',
  'Metrics / data',
  'Peer recognition',
  'External link',
])

/** Map evidence type count to strength label + hint (mirrors DB schema comment). */
function deriveStrength(count) {
  if (count === 0) return { strength: 'Building', hint: 'Add evidence to strengthen this entry' }
  if (count === 1) return { strength: 'Good',     hint: 'Add more evidence types to reach Solid' }
  if (count === 2) return { strength: 'Solid',    hint: 'Add a third evidence type to reach Strong' }
  if (count === 3) return { strength: 'Strong',   hint: 'Add all 4 evidence types for Exceptional' }
  return { strength: 'Exceptional', hint: 'Strong across all evidence types' }
}

export async function GET(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const url    = new URL(request.url)
  const limit  = Math.min(parseInt(url.searchParams.get('limit')  ?? '20', 10), 100)
  const offset = parseInt(url.searchParams.get('offset') ?? '0',  10)

  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    order:   'entry_date.desc,created_at.desc',
    limit:   String(limit),
    offset:  String(offset),
    // Embed evidence rows via PostgREST resource embedding.
    select:  'id,title,body,entry_date,strength,strength_hint,visible_to_manager,created_at,updated_at,brag_entry_evidence(type)',
  })

  const { data: entries, error } = await select('brag_entries', query.toString())

  if (error) {
    console.error('[brag/entries GET]', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }

  return NextResponse.json({ entries: entries ?? [] })
}

export async function POST(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const body = await request.json().catch(() => ({}))

  const title      = (body.title ?? '').trim()
  const entryBody  = (body.body  ?? '').trim()
  const entryDate  = body.entry_date ?? new Date().toISOString().slice(0, 10)
  const visible    = body.visible_to_manager !== false
  const rawTypes   = Array.isArray(body.evidence_types) ? body.evidence_types : []

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  // Validate date format.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
    return NextResponse.json({ error: 'entry_date must be YYYY-MM-DD' }, { status: 400 })
  }

  // Validate evidence types.
  const evidenceTypes = rawTypes.filter((t) => VALID_EVIDENCE_TYPES.has(t))
  const { strength, hint } = deriveStrength(evidenceTypes.length)

  // Insert entry.
  const { data: rows, error: entryError } = await insert('brag_entries', {
    user_id:             userId,
    title,
    body:                entryBody || null,
    entry_date:          entryDate,
    strength,
    strength_hint:       hint,
    visible_to_manager:  visible,
  })

  if (entryError || !rows?.length) {
    console.error('[brag/entries POST] entry insert error:', entryError)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }

  const entry = rows[0]

  // Insert evidence type rows.
  if (evidenceTypes.length) {
    const evidenceRows = evidenceTypes.map((type) => ({
      entry_id: entry.id,
      type,
    }))
    const { error: evErr } = await insert('brag_entry_evidence', evidenceRows)
    if (evErr) {
      console.error('[brag/entries POST] evidence insert error:', evErr)
      // Non-fatal — entry was created; evidence can be added separately.
    }
  }

  return NextResponse.json({ ok: true, entry }, { status: 201 })
}
