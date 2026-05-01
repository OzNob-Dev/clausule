import { insert, select, update } from '@api/_lib/supabase.js'
import { findProfileById } from '@auth/server/accountRepository.js'
import { createEntry } from './entries.js'

const SESSION_SELECT = 'id,user_id,profile_name,headline,linkedin_url,status,source_snapshot,published_at,created_at,updated_at,linkedin_import_items(id,kind,title,body,organization,entry_date,evidence_type,selected,sort_order,brag_entry_id,created_at)'

const KIND_TO_EVIDENCE_TYPE = {
  experience: 'Work artefact',
  achievement: 'Metrics / data',
  recommendation: 'Peer recognition',
  skill: 'External link',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function displayName(profile) {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || profile.email?.split('@')[0] || 'LinkedIn profile'
}

function headline(profile) {
  return [profile.job_title, profile.department].filter(Boolean).join(' · ').trim() || 'Professional snapshot'
}

function buildSeed(profile) {
  const name = displayName(profile)
  const role = profile.job_title?.trim() || 'their role'
  const dept = profile.department?.trim() || 'the team'
  const focus = profile.department?.trim() || 'the business'

  return {
    session: {
      profile_name: name,
      headline: headline(profile),
      linkedin_url: null,
      status: 'ready',
      source_snapshot: {
        profile: {
          name,
          email: profile.email ?? '',
          job_title: profile.job_title ?? '',
          department: profile.department ?? '',
        },
        imported_sections: ['experience', 'achievement', 'recommendation', 'skill'],
      },
    },
    items: [
      {
        kind: 'experience',
        title: `Expanded the ${dept} workflow`,
        body: `Built a calmer operating rhythm for ${focus} and made handoffs easier to follow.`,
        organization: dept,
        entry_date: today(),
        evidence_type: KIND_TO_EVIDENCE_TYPE.experience,
        sort_order: 0,
      },
      {
        kind: 'achievement',
        title: `Improved delivery for ${role}`,
        body: 'Turned recurring follow-up work into a shorter, more repeatable process.',
        organization: dept,
        entry_date: today(),
        evidence_type: KIND_TO_EVIDENCE_TYPE.achievement,
        sort_order: 1,
      },
      {
        kind: 'recommendation',
        title: 'Recommendation from a cross-functional partner',
        body: `Praised for clear communication, steady execution, and practical collaboration.`,
        organization: 'LinkedIn',
        entry_date: today(),
        evidence_type: KIND_TO_EVIDENCE_TYPE.recommendation,
        sort_order: 2,
      },
      {
        kind: 'skill',
        title: 'Highlighted skills and certifications',
        body: 'Accessibility, design systems, stakeholder alignment, and data-informed decision making.',
        organization: 'LinkedIn',
        entry_date: today(),
        evidence_type: KIND_TO_EVIDENCE_TYPE.skill,
        sort_order: 3,
      },
    ],
  }
}

function normalizeSession(row) {
  if (!row) return null
  return {
    ...row,
    linkedin_import_items: [...(row.linkedin_import_items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }
}

async function getOwnedSession(userId, sessionId) {
  const { data, error } = await select('linkedin_import_sessions', new URLSearchParams({
    id: `eq.${sessionId}`,
    user_id: `eq.${userId}`,
    select: SESSION_SELECT,
    limit: '1',
  }).toString())

  if (error) return { error, session: null }
  return { session: normalizeSession(data?.[0] ?? null), error: null }
}

export async function getLatestLinkedInImport({ userId }) {
  const { data, error } = await select('linkedin_import_sessions', new URLSearchParams({
    user_id: `eq.${userId}`,
    order: 'created_at.desc',
    select: SESSION_SELECT,
    limit: '1',
  }).toString())

  if (error) return { log: ['[brag/linkedin GET]', error], body: { error: 'Failed to fetch LinkedIn import' }, status: 500 }
  return { body: { session: normalizeSession(data?.[0] ?? null) }, status: 200 }
}

export async function createLinkedInImport({ userId }) {
  const { profile, error: profileError } = await findProfileById(userId, 'first_name,last_name,email,job_title,department')
  if (profileError) return { log: ['[brag/linkedin POST] profile lookup error:', profileError], body: { error: 'Failed to create LinkedIn import' }, status: 500 }
  if (!profile) return { body: { error: 'Profile not found' }, status: 404 }

  const seed = buildSeed(profile)
  const { data: sessionRows, error: sessionError } = await insert('linkedin_import_sessions', {
    user_id: userId,
    ...seed.session,
  }, { expectRows: 'single' })
  const session = Array.isArray(sessionRows) ? sessionRows[0] : sessionRows

  if (sessionError || !session) return { log: ['[brag/linkedin POST] session insert error:', sessionError], body: { error: 'Failed to create LinkedIn import' }, status: 500 }

  const { error: itemError } = await insert('linkedin_import_items', seed.items.map((item) => ({
    session_id: session.id,
    ...item,
  })), { expectRows: 'any' })

  if (itemError) return { log: ['[brag/linkedin POST] item insert error:', itemError], body: { error: 'Failed to create LinkedIn import' }, status: 500 }

  const refreshed = await getOwnedSession(userId, session.id)
  if (refreshed.error) return { log: ['[brag/linkedin POST] refresh error:', refreshed.error], body: { error: 'Failed to create LinkedIn import' }, status: 500 }
  return { body: { session: refreshed.session }, status: 201 }
}

export async function updateLinkedInImport({ userId, sessionId, body }) {
  const { session, error } = await getOwnedSession(userId, sessionId)
  if (error) return { log: ['[brag/linkedin PATCH] session lookup error:', error], body: { error: 'Failed to update LinkedIn import' }, status: 500 }
  if (!session) return { body: { error: 'Not found' }, status: 404 }

  if (body.status) {
    const status = String(body.status)
    if (!['draft', 'ready', 'published', 'skipped'].includes(status)) return { body: { error: 'status is invalid' }, status: 400 }
    const { error: statusError } = await update('linkedin_import_sessions', `id=eq.${sessionId}&user_id=eq.${userId}`, { status }, { expectRows: 'single' })
    if (statusError) return { log: ['[brag/linkedin PATCH] status update error:', statusError], body: { error: 'Failed to update LinkedIn import' }, status: 500 }
  }

  if (body.itemId !== undefined) {
    const selected = body.selected !== false
    const { error: itemError } = await update('linkedin_import_items', `id=eq.${body.itemId}&session_id=eq.${sessionId}`, { selected }, { expectRows: 'single' })
    if (itemError) return { log: ['[brag/linkedin PATCH] item update error:', itemError], body: { error: 'Failed to update LinkedIn import' }, status: 500 }
  }

  const refreshed = await getOwnedSession(userId, sessionId)
  if (refreshed.error) return { log: ['[brag/linkedin PATCH] refresh error:', refreshed.error], body: { error: 'Failed to update LinkedIn import' }, status: 500 }
  return { body: { session: refreshed.session }, status: 200 }
}

export async function publishLinkedInImport({ userId, sessionId }) {
  const { session, error } = await getOwnedSession(userId, sessionId)
  if (error) return { log: ['[brag/linkedin publish] session lookup error:', error], body: { error: 'Failed to publish LinkedIn import' }, status: 500 }
  if (!session) return { body: { error: 'Not found' }, status: 404 }
  if (session.status === 'published') return { body: { session, entries: [] }, status: 200 }

  const entries = []
  for (const item of session.linkedin_import_items ?? []) {
    if (!item.selected || item.brag_entry_id) continue

    const created = await createEntry({
      userId,
      body: {
        title: item.title,
        body: item.body ?? '',
        entry_date: item.entry_date ?? today(),
        visible_to_manager: false,
        evidence_types: [item.evidence_type ?? KIND_TO_EVIDENCE_TYPE[item.kind] ?? 'External link'],
      },
    })
    const entry = created?.body?.entry
    const entryError = created?.error
    if (entryError || !entry) return { log: ['[brag/linkedin publish] create entry error:', entryError], body: { error: 'Failed to publish LinkedIn import' }, status: 500 }

    entries.push(entry)
    const { error: itemUpdateError } = await update('linkedin_import_items', `id=eq.${item.id}&session_id=eq.${sessionId}`, {
      brag_entry_id: entry.id,
    }, { expectRows: 'single' })
    if (itemUpdateError) return { log: ['[brag/linkedin publish] item update error:', itemUpdateError], body: { error: 'Failed to publish LinkedIn import' }, status: 500 }
  }

  const { error: publishError } = await update('linkedin_import_sessions', `id=eq.${sessionId}&user_id=eq.${userId}`, {
    status: 'published',
    published_at: new Date().toISOString(),
  }, { expectRows: 'single' })
  if (publishError) return { log: ['[brag/linkedin publish] session update error:', publishError], body: { error: 'Failed to publish LinkedIn import' }, status: 500 }

  const refreshed = await getOwnedSession(userId, sessionId)
  if (refreshed.error) return { log: ['[brag/linkedin publish] refresh error:', refreshed.error], body: { error: 'Failed to publish LinkedIn import' }, status: 500 }
  return { body: { session: refreshed.session, entries }, status: 200 }
}
