import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createLinkedInImport, publishLinkedInImport, updateLinkedInImport } from './linkedinImports.js'
import { createEntry } from './entries.js'
import { findProfileById } from '@auth/server/accountRepository.js'
import { insert, select, update } from '@api/_lib/supabase.js'

vi.mock('@api/_lib/supabase.js', () => ({
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
}))

vi.mock('./entries.js', () => ({
  createEntry: vi.fn(),
  deriveStrength: vi.fn(),
}))

vi.mock('@auth/server/accountRepository.js', () => ({
  findProfileById: vi.fn(),
}))

describe('linkedin imports server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a seeded import session with draft items', async () => {
    findProfileById.mockResolvedValueOnce({
      profile: {
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        job_title: 'Senior Product Designer',
        department: 'Anthropic',
      },
      error: null,
    })
    insert.mockResolvedValueOnce({ data: [{ id: 'session-1' }], error: null })
    insert.mockResolvedValueOnce({ data: [{ id: 'item-1' }], error: null })
    select.mockResolvedValueOnce({
      data: [{
        id: 'session-1',
        profile_name: 'Ada Lovelace',
        status: 'ready',
        linkedin_import_items: [{ id: 'item-1', sort_order: 0 }],
      }],
      error: null,
    })

    const result = await createLinkedInImport({ userId: 'user-1' })

    expect(result.status).toBe(201)
    expect(insert).toHaveBeenCalledWith('linkedin_import_sessions', expect.objectContaining({
      user_id: 'user-1',
      profile_name: 'Ada Lovelace',
      status: 'ready',
    }), { expectRows: 'single' })
    expect(insert).toHaveBeenCalledWith('linkedin_import_items', expect.arrayContaining([expect.objectContaining({
      session_id: 'session-1',
      evidence_type: 'Work artefact',
    })]), { expectRows: 'any' })
  })

  it('updates item selection and session status', async () => {
    select.mockResolvedValueOnce({
      data: [{
        id: 'session-1',
        profile_name: 'Ada Lovelace',
        status: 'ready',
        linkedin_import_items: [],
      }],
      error: null,
    })
    update.mockResolvedValueOnce({ data: [{ id: 'session-1' }], error: null })
    select.mockResolvedValueOnce({
      data: [{
        id: 'session-1',
        profile_name: 'Ada Lovelace',
        status: 'skipped',
        linkedin_import_items: [],
      }],
      error: null,
    })

    const result = await updateLinkedInImport({ userId: 'user-1', sessionId: 'session-1', body: { status: 'skipped' } })

    expect(result.status).toBe(200)
    expect(update).toHaveBeenCalledWith('linkedin_import_sessions', 'id=eq.session-1&user_id=eq.user-1', { status: 'skipped' }, { expectRows: 'single' })
  })

  it('publishes selected draft items into brag entries', async () => {
    select.mockResolvedValueOnce({
      data: [{
        id: 'session-1',
        profile_name: 'Ada Lovelace',
        status: 'ready',
        linkedin_import_items: [{
          id: 'item-1',
          kind: 'achievement',
          title: 'Improved delivery',
          body: 'Reduced handoff time.',
          entry_date: '2026-04-28',
          evidence_type: 'Metrics / data',
          selected: true,
        }],
      }],
      error: null,
    })
    createEntry.mockResolvedValueOnce({
      body: { entry: { id: 'entry-1', title: 'Improved delivery' } },
      error: null,
    })
    update.mockResolvedValueOnce({ data: [{ id: 'item-1' }], error: null })
    update.mockResolvedValueOnce({ data: [{ id: 'session-1' }], error: null })
    select.mockResolvedValueOnce({
      data: [{
        id: 'session-1',
        profile_name: 'Ada Lovelace',
        status: 'published',
        linkedin_import_items: [],
      }],
      error: null,
    })

    const result = await publishLinkedInImport({ userId: 'user-1', sessionId: 'session-1' })

    expect(result.status).toBe(200)
    expect(createEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      body: expect.objectContaining({
        title: 'Improved delivery',
        visible_to_manager: false,
        evidence_types: ['Metrics / data'],
      }),
    })
  })
})
