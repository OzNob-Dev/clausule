import { beforeEach, describe, expect, it, vi } from 'vitest'
import { beginBackendOperation, passkeyAttemptOperationKey } from '@features/auth/server/backendOperation.js'
import { issueRecoverableSession } from '@features/auth/server/recoverableSession.js'
import { verifyPasskeyAuthentication } from '@features/auth/server/passkeyAuthentication.js'
import { POST } from './route.js'

vi.mock('@features/auth/server/backendOperation.js', () => ({
  beginBackendOperation: vi.fn(),
  passkeyAttemptOperationKey: vi.fn(),
}))

vi.mock('@features/auth/server/passkeyAuthentication.js', () => ({
  verifyPasskeyAuthentication: vi.fn(),
}))

vi.mock('@features/auth/server/recoverableSession.js', () => ({
  issueRecoverableSession: vi.fn(),
}))

function request(body = {
  credential: { rawId: 'cred-1' },
  _signedChallenge: 'signed.challenge',
}) {
  return new Request('http://localhost/api/auth/passkeys/authenticate/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('passkeys/authenticate/verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    passkeyAttemptOperationKey.mockReturnValue('login_passkey:cred-1:hashed')
    beginBackendOperation.mockResolvedValue({
      row: { status: 'started' },
      replay: null,
    })
    verifyPasskeyAuthentication.mockResolvedValue({
      body: { ok: true, role: 'employee' },
      status: 200,
      session: { userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'passkey' },
    })
    issueRecoverableSession.mockResolvedValue(new Response(JSON.stringify({ ok: true, role: 'employee' }), { status: 200 }))
  })

  it('creates a recoverable passkey session after a valid assertion', async () => {
    const response = await POST(request())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(passkeyAttemptOperationKey).toHaveBeenCalledWith({
      credentialId: 'cred-1',
      signedChallenge: 'signed.challenge',
    })
    expect(beginBackendOperation).toHaveBeenCalledWith({
      operationKey: 'login_passkey:cred-1:hashed',
      operationType: 'login_passkey',
    })
    expect(verifyPasskeyAuthentication).toHaveBeenCalled()
    expect(data).toEqual({ ok: true, role: 'employee' })
  })

  it('replays a completed passkey login without re-verifying the assertion', async () => {
    beginBackendOperation.mockResolvedValueOnce({
      row: { status: 'completed' },
      replay: {
        body: { ok: true, role: 'employee' },
        status: 200,
        session: { userId: 'user-1', email: 'ada@example.com', role: 'employee' },
      },
    })

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(verifyPasskeyAuthentication).not.toHaveBeenCalled()
    expect(issueRecoverableSession).toHaveBeenCalled()
  })

  it('rejects malformed passkey auth payloads early', async () => {
    const response = await POST(request({ credential: {}, _signedChallenge: '' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'credential and _signedChallenge required' })
  })
})
