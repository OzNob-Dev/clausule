import { beforeEach, describe, expect, it, vi } from 'vitest'
import { issueRecoverableSession } from './recoverableSession.js'

vi.mock('@api/_lib/auth.js', () => ({
  clearAuthCookies: vi.fn(() => ['clausule_at=; Max-Age=0']),
}))

vi.mock('@api/_lib/session.js', () => ({
  appendSessionCookies: vi.fn((response) => response),
  createPersistentSession: vi.fn(async () => ({ accessToken: 'at', refreshToken: 'rt' })),
}))

vi.mock('./backendOperation.js', () => ({
  beginBackendOperation: vi.fn(),
  completeBackendOperation: vi.fn(),
}))

import { beginBackendOperation, completeBackendOperation } from './backendOperation.js'

describe('issueRecoverableSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    beginBackendOperation.mockResolvedValue({ row: { status: 'started' }, replay: null })
    completeBackendOperation.mockResolvedValue({ error: null })
  })

  it('returns a success response when the session is persisted', async () => {
    const response = await issueRecoverableSession({
      operationKey: 'k',
      operationType: 'register',
      body: { ok: true },
      status: 200,
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee' },
      failureMessage: 'failed',
    })

    expect(response.status).toBe(200)
    expect(beginBackendOperation).toHaveBeenCalled()
    expect(completeBackendOperation).toHaveBeenCalled()
  })
})
