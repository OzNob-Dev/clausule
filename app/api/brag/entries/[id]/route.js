/**
 * /api/brag/entries/[id]
 *
 * GET    — fetch a single brag entry (with evidence types).
 * PUT    — update entry fields.
 *          Body: { title?, body?, entry_date?, strength?, strength_hint?,
 *                  visible_to_manager?, evidence_types? }
 * DELETE — delete entry (cascades to evidence + files via DB FK).
 *
 * All operations are scoped to the authenticated user's own entries.
 */

import { NextResponse }               from 'next/server'
import { requireAuth, unauthorized }  from '@api/_lib/auth.js'
import { select, update, del, insert } from '@api/_lib/supabase.js'

const VALID_EVIDENCE_TYPES = new Set([
  'Work artefact',
  'Metrics / data',
  'Peer recognition',
  'External link',
])

function deriveStrength(count) {
  if (count === 0) return { strength: 'Building', hint: 'Add evidence to strengthen this entry' }
  if (count === 1) return { strength: 'Good',     hint: 'Add more evidence types to reach Solid' }
  if (count === 2) return { strength: 'Solid',    hint: 'Add a third evidence type to reach Strong' }
  if (count === 3) return { strength: 'Strong',   hint: 'Add all 4 evidence types for Exceptional' }
  return { strength: 'Exceptional', hint: 'Strong across all evidence types' }
}

/** Verify the entry exists and belongs to the requesting user. */
async function getOwnedEntry(entryId, userId) {
  const { data: rows } = await select(
    'brag_entries',
    `id=eq.${entryId}&user_id=eq.${userId}&limit=1`
  )
  return rows?.[0] ?? null
}

export async function GET(request, { params }) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const id = params.id
  const { data: rows, error } = await select(
    'brag_entries',
    `id=eq.${id}&user_id=eq.${userId}&select=id,title,body,entry_date,strength,strength_hint,visible_to_manager,created_at,updated_at,brag_entry_evidence(type)&limit=1`
  )

  if (error) {
    console.error('[brag/entries/[id] GET]', error)
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 })
  }

  if (!rows?.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ entry: rows[0] })
}

export async function PUT(request, { params }) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const id  = params.id
  const existing = await getOwnedEntry(id, userId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))

  // Build the update payload — only include fields that were provided.
  const patch = {}
  if (body.title !== undefined)              patch.title              = String(body.title).trim()
  if (body.body  !== undefined)              patch.body               = String(body.body).trim() || null
  if (body.entry_date !== undefined)         patch.entry_date         = body.entry_date
  if (body.visible_to_manager !== undefined) patch.visible_to_manager = Boolean(body.visible_to_manager)

  // If evidence_types provided, recalculate strength.
  if (Array.isArray(body.evidence_types)) {
    const validTypes = body.evidence_types.filter((t) => VALID_EVIDENCE_TYPES.has(t))
    const { strength, hint } = deriveStrength(validTypes.length)
    patch.strength      = strength
    patch.strength_hint = hint

    // Replace evidence rows: delete existing then re-insert.
    await del('brag_entry_evidence', `entry_id=eq.${id}`)
    if (validTypes.length) {
      await insert(
        'brag_entry_evidence',
        validTypes.map((type) => ({ entry_id: id, type }))
      )
    }
  }

  if (body.title !== undefined && !patch.title) {
    return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 })
  }

  const { data: rows, error } = await update(
    'brag_entries',
    `id=eq.${id}&user_id=eq.${userId}`,
    patch
  )

  if (error) {
    console.error('[brag/entries/[id] PUT]', error)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, entry: rows?.[0] ?? null })
}

export async function DELETE(request, { params }) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const id       = params.id
  const existing = await getOwnedEntry(id, userId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await del('brag_entries', `id=eq.${id}&user_id=eq.${userId}`)

  if (error) {
    console.error('[brag/entries/[id] DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
