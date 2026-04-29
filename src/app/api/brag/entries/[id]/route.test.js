import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DELETE, GET, PUT } from './route'

const { requireActiveAuth, authErrorResponse, getEntry, updateEntry, deleteEntry } = vi.hoisted(() => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message) => Response.json({ error: message }, { status: 401 })),
  getEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth,
  authErrorResponse,
}))

vi.mock('@brag/server/entries.js', () => ({
  getEntry,
  updateEntry,
  deleteEntry,
}))

describe('brag entry route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('returns a single entry on GET', async () => {
    getEntry.mockResolvedValueOnce({ status: 200, body: { id: 'entry-1' } })

    const response = await GET(new Request('http://localhost/api/brag/entries/entry-1'), { params: { id: 'entry-1' } })

    expect(getEntry).toHaveBeenCalledWith({ userId: 'user-1', entryId: 'entry-1' })
    expect(await response.json()).toEqual({ id: 'entry-1' })
  })

  it('updates an entry on PUT', async () => {
    updateEntry.mockResolvedValueOnce({ status: 200, body: { id: 'entry-1', title: 'Updated' } })

    const response = await PUT(new Request('http://localhost/api/brag/entries/entry-1', { method: 'PUT', body: JSON.stringify({ title: 'Updated' }) }), { params: { id: 'entry-1' } })

    expect(updateEntry).toHaveBeenCalledWith({ userId: 'user-1', entryId: 'entry-1', body: { title: 'Updated' } })
    expect(await response.json()).toEqual({ id: 'entry-1', title: 'Updated' })
  })

  it('deletes an entry with a 204 response', async () => {
    deleteEntry.mockResolvedValueOnce({ status: 204, body: null })

    const response = await DELETE(new Request('http://localhost/api/brag/entries/entry-1', { method: 'DELETE' }), { params: { id: 'entry-1' } })

    expect(response.status).toBe(204)
  })
})
