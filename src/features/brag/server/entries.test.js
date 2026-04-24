import { beforeEach, describe, expect, it, vi } from 'vitest'
import { del, rpc, select } from '@api/_lib/supabase.js'
import { createEntry, updateEntry } from './entries.js'

vi.mock('@api/_lib/supabase.js', () => ({
  del: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
}))

describe('entries server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an entry atomically with evidence through the DB rpc', async () => {
    rpc.mockResolvedValueOnce({
      data: [{
        id: 'entry-1',
        title: 'Won migration',
        body: 'Cut deployment risk.',
        entry_date: '2026-04-20',
        strength: 'Good',
        strength_hint: 'Add more evidence types to reach Solid',
        visible_to_manager: true,
      }],
      error: null,
    })

    const result = await createEntry({
      userId: 'user-1',
      body: {
        title: 'Won migration',
        body: 'Cut deployment risk.',
        entry_date: '2026-04-20',
        visible_to_manager: true,
        evidence_types: ['Work artefact'],
      },
    })

    expect(result.status).toBe(201)
    expect(rpc).toHaveBeenCalledWith('create_brag_entry_with_evidence', {
      p_user_id: 'user-1',
      p_title: 'Won migration',
      p_body: 'Cut deployment risk.',
      p_entry_date: '2026-04-20',
      p_strength: 'Good',
      p_strength_hint: 'Add more evidence types to reach Solid',
      p_visible_to_manager: true,
      p_evidence_types: ['Work artefact'],
    }, { expectRows: 'single' })
  })

  it('updates an entry atomically with evidence replacement through the DB rpc', async () => {
    select.mockResolvedValueOnce({ data: [{ id: 'entry-1' }], error: null })
    rpc.mockResolvedValueOnce({
      data: [{
        id: 'entry-1',
        title: 'Won migration',
        body: 'Cut deployment risk.',
        entry_date: '2026-04-20',
        strength: 'Solid',
        strength_hint: 'Add a third evidence type to reach Strong',
        visible_to_manager: false,
      }],
      error: null,
    })

    const result = await updateEntry({
      userId: 'user-1',
      entryId: 'entry-1',
      body: {
        visible_to_manager: false,
        evidence_types: ['Work artefact', 'Metrics / data'],
      },
    })

    expect(result.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith('update_brag_entry_with_evidence', {
      p_entry_id: 'entry-1',
      p_user_id: 'user-1',
      p_title: null,
      p_body: null,
      p_entry_date: null,
      p_strength: 'Solid',
      p_strength_hint: 'Add a third evidence type to reach Strong',
      p_visible_to_manager: false,
      p_replace_evidence: true,
      p_evidence_types: ['Work artefact', 'Metrics / data'],
    }, { expectRows: 'single' })
    expect(del).not.toHaveBeenCalled()
  })
})
