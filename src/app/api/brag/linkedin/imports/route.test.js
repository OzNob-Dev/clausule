import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

const { requireActiveAuth, authErrorResponse, getLatestLinkedInImport, createLinkedInImport } = vi.hoisted(() => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message) => Response.json({ error: message }, { status: 401 })),
  getLatestLinkedInImport: vi.fn(),
  createLinkedInImport: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth,
  authErrorResponse,
}))

vi.mock('@brag/server/linkedinImports.js', () => ({
  getLatestLinkedInImport,
  createLinkedInImport,
}))

describe('linkedin imports route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('returns the latest import on GET', async () => {
    getLatestLinkedInImport.mockResolvedValueOnce({ status: 200, body: { id: 'import-1' } })

    const response = await GET(new Request('http://localhost/api/brag/linkedin/imports'))

    expect(await response.json()).toEqual({ id: 'import-1' })
  })

  it('creates a new import on POST', async () => {
    createLinkedInImport.mockResolvedValueOnce({ status: 201, body: { id: 'import-2' } })

    const response = await POST(new Request('http://localhost/api/brag/linkedin/imports', { method: 'POST', body: JSON.stringify({ url: 'https://linkedin.com' }) }))

    expect(createLinkedInImport).toHaveBeenCalledWith({ userId: 'user-1', body: { url: 'https://linkedin.com' } })
    expect(response.status).toBe(201)
  })
})
