import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const { requireActiveAuth, authErrorResponse, publishLinkedInImport } = vi.hoisted(() => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message) => Response.json({ error: message }, { status: 401 })),
  publishLinkedInImport: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth,
  authErrorResponse,
}))

vi.mock('@brag/server/linkedinImports.js', () => ({
  publishLinkedInImport,
}))

describe('linkedin publish route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('publishes an import on POST', async () => {
    publishLinkedInImport.mockResolvedValueOnce({ status: 200, body: { ok: true } })

    const response = await POST(new Request('http://localhost/api/brag/linkedin/imports/import-1/publish', { method: 'POST' }), { params: { id: 'import-1' } })

    expect(publishLinkedInImport).toHaveBeenCalledWith({ userId: 'user-1', sessionId: 'import-1' })
    expect(await response.json()).toEqual({ ok: true })
  })
})
