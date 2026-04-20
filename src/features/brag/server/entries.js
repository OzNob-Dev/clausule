import { del, insert, select, update } from '@api/_lib/supabase.js'

const VALID_EVIDENCE_TYPES = new Set([
  'Work artefact',
  'Metrics / data',
  'Peer recognition',
  'External link',
])

export function deriveStrength(count) {
  if (count === 0) return { strength: 'Building', hint: 'Add evidence to strengthen this entry' }
  if (count === 1) return { strength: 'Good', hint: 'Add more evidence types to reach Solid' }
  if (count === 2) return { strength: 'Solid', hint: 'Add a third evidence type to reach Strong' }
  if (count === 3) return { strength: 'Strong', hint: 'Add all 4 evidence types for Exceptional' }
  return { strength: 'Exceptional', hint: 'Strong across all evidence types' }
}

function validEvidenceTypes(value) {
  return Array.isArray(value) ? value.filter((type) => VALID_EVIDENCE_TYPES.has(type)) : []
}

function entrySelect() {
  return 'id,title,body,entry_date,strength,strength_hint,visible_to_manager,created_at,updated_at,brag_entry_evidence(type)'
}

export async function listEntries({ userId, searchParams }) {
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)
  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    order: 'entry_date.desc,created_at.desc',
    limit: String(limit),
    offset: String(offset),
    select: entrySelect(),
  })

  const { data, error } = await select('brag_entries', query.toString())
  if (error) return { log: ['[brag/entries GET]', error], body: { error: 'Failed to fetch entries' }, status: 500 }
  return { body: { entries: data ?? [] }, status: 200 }
}

export async function createEntry({ userId, body }) {
  const title = (body.title ?? '').trim()
  const entryBody = (body.body ?? '').trim()
  const entryDate = body.entry_date ?? new Date().toISOString().slice(0, 10)
  const visible = body.visible_to_manager !== false

  if (!title) return { body: { error: 'title is required' }, status: 400 }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) return { body: { error: 'entry_date must be YYYY-MM-DD' }, status: 400 }

  const evidenceTypes = validEvidenceTypes(body.evidence_types)
  const { strength, hint } = deriveStrength(evidenceTypes.length)
  const { data: rows, error } = await insert('brag_entries', {
    user_id: userId,
    title,
    body: entryBody || null,
    entry_date: entryDate,
    strength,
    strength_hint: hint,
    visible_to_manager: visible,
  })

  if (error || !rows?.length) return { log: ['[brag/entries POST] entry insert error:', error], body: { error: 'Failed to create entry' }, status: 500 }

  const entry = rows[0]
  if (evidenceTypes.length) {
    const { error: evidenceError } = await insert('brag_entry_evidence', evidenceTypes.map((type) => ({ entry_id: entry.id, type })))
    if (evidenceError) return { log: ['[brag/entries POST] evidence insert error:', evidenceError], body: { ok: true, entry }, status: 201 }
  }

  return { body: { ok: true, entry }, status: 201 }
}

async function getOwnedEntry(entryId, userId) {
  const { data } = await select('brag_entries', `id=eq.${entryId}&user_id=eq.${userId}&limit=1`)
  return data?.[0] ?? null
}

export async function getEntry({ userId, entryId }) {
  const { data, error } = await select(
    'brag_entries',
    `id=eq.${entryId}&user_id=eq.${userId}&select=${entrySelect()}&limit=1`
  )

  if (error) return { log: ['[brag/entries/[id] GET]', error], body: { error: 'Failed to fetch entry' }, status: 500 }
  if (!data?.length) return { body: { error: 'Not found' }, status: 404 }
  return { body: { entry: data[0] }, status: 200 }
}

export async function updateEntry({ userId, entryId, body }) {
  const existing = await getOwnedEntry(entryId, userId)
  if (!existing) return { body: { error: 'Not found' }, status: 404 }

  const patch = {}
  if (body.title !== undefined) patch.title = String(body.title).trim()
  if (body.body !== undefined) patch.body = String(body.body).trim() || null
  if (body.entry_date !== undefined) patch.entry_date = body.entry_date
  if (body.visible_to_manager !== undefined) patch.visible_to_manager = Boolean(body.visible_to_manager)

  if (Array.isArray(body.evidence_types)) {
    const evidenceTypes = validEvidenceTypes(body.evidence_types)
    const { strength, hint } = deriveStrength(evidenceTypes.length)
    patch.strength = strength
    patch.strength_hint = hint

    await del('brag_entry_evidence', `entry_id=eq.${entryId}`)
    if (evidenceTypes.length) {
      await insert('brag_entry_evidence', evidenceTypes.map((type) => ({ entry_id: entryId, type })))
    }
  }

  if (body.title !== undefined && !patch.title) return { body: { error: 'title cannot be empty' }, status: 400 }

  const { data, error } = await update('brag_entries', `id=eq.${entryId}&user_id=eq.${userId}`, patch)
  if (error) return { log: ['[brag/entries/[id] PUT]', error], body: { error: 'Failed to update entry' }, status: 500 }
  return { body: { ok: true, entry: data?.[0] ?? null }, status: 200 }
}

export async function deleteEntry({ userId, entryId }) {
  const existing = await getOwnedEntry(entryId, userId)
  if (!existing) return { body: { error: 'Not found' }, status: 404 }

  const { error } = await del('brag_entries', `id=eq.${entryId}&user_id=eq.${userId}`)
  if (error) return { log: ['[brag/entries/[id] DELETE]', error], body: { error: 'Failed to delete entry' }, status: 500 }
  return { status: 204 }
}
