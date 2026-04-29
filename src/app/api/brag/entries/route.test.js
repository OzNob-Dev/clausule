import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

const { requireActiveAuth, authErrorResponse, listEntries, createEntry, consumeDistributedRateLimit } = vi.hoisted(() => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message) => Response.json({ error: message }, { status: 401 })),
  listEntries: vi.fn(),
  createEntry: vi.fn(),
  consumeDistributedRateLimit: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth,
  authErrorResponse,
}))

vi.mock('@brag/server/entries.js', () => ({
  listEntries,
  createEntry,
}))

vi.mock('@auth/server/distributedRateLimit.js', () => ({
  consumeDistributedRateLimit,
}))

describe('brag entries route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('lists entries on GET', async () => {
    listEntries.mockResolvedValueOnce({ status: 200, body: { entries: [] } })

    const response = await GET(new Request('http://localhost/api/brag/entries?search=win'))

    expect(listEntries).toHaveBeenCalledWith({ userId: 'user-1', searchParams: new URL('http://localhost/api/brag/entries?search=win').searchParams })
    expect(await response.json()).toEqual({ entries: [] })
  })

  it('rejects the post when the rate limit is exceeded', async () => {
    consumeDistributedRateLimit.mockResolvedValueOnce({ allowed: false, retryAfterMs: 2500, error: null })

    const response = await POST(new Request('http://localhost/api/brag/entries', { method: 'POST', body: '{}' }))

    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('3')
  })

  it('creates an entry when the rate limit allows it', async () => {
    consumeDistributedRateLimit.mockResolvedValueOnce({ allowed: true, retryAfterMs: 0, error: null })
    createEntry.mockResolvedValueOnce({ status: 201, body: { id: 'entry-1' } })

    const response = await POST(new Request('http://localhost/api/brag/entries', { method: 'POST', body: JSON.stringify({ title: 'Win' }) }))

    expect(createEntry).toHaveBeenCalledWith({ userId: 'user-1', body: { title: 'Win' } })
    expect(response.status).toBe(201)
  })
})
