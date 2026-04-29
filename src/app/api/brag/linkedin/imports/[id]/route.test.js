import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PATCH } from './route'

const { requireActiveAuth, authErrorResponse, updateLinkedInImport } = vi.hoisted(() => ({
  requireActiveAuth: vi.fn(),
  authErrorResponse: vi.fn((message) => Response.json({ error: message }, { status: 401 })),
  updateLinkedInImport: vi.fn(),
}))

vi.mock('@api/_lib/auth.js', () => ({
  requireActiveAuth,
  authErrorResponse,
}))

vi.mock('@brag/server/linkedinImports.js', () => ({
  updateLinkedInImport,
}))

describe('linkedin import route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireActiveAuth.mockResolvedValue({ userId: 'user-1', error: null })
  })

  it('updates an import on PATCH', async () => {
    updateLinkedInImport.mockResolvedValueOnce({ status: 200, body: { ok: true } })

    const response = await PATCH(new Request('http://localhost/api/brag/linkedin/imports/import-1', { method: 'PATCH', body: JSON.stringify({ note: 'ok' }) }), { params: { id: 'import-1' } })

    expect(updateLinkedInImport).toHaveBeenCalledWith({ userId: 'user-1', sessionId: 'import-1', body: { note: 'ok' } })
    expect(await response.json()).toEqual({ ok: true })
  })
})
