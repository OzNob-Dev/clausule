import { NextResponse } from 'next/server'
import { beginBackendOperation, passkeyAttemptOperationKey } from '@features/auth/server/backendOperation.js'
import { verifyPasskeyAuthentication } from '@features/auth/server/passkeyAuthentication.js'
import { issueRecoverableSession } from '@features/auth/server/recoverableSession.js'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const credentialId = String(body?.credential?.rawId ?? body?.credential?.id ?? '').trim()
    const signedChallenge = String(body?._signedChallenge ?? '').trim()

    if (!credentialId || !signedChallenge) {
      return NextResponse.json({ error: 'credential and _signedChallenge required' }, { status: 400 })
    }

    const operationKey = passkeyAttemptOperationKey({ credentialId, signedChallenge })
    const operation = await beginBackendOperation({
      operationKey,
      operationType: 'login_passkey',
    })
    if (operation.error) {
      console.error('[passkeys/auth/verify] begin operation error:', operation.error)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }
    if (operation.replay) {
      return issueRecoverableSession({
        operation,
        operationKey,
        operationType: 'login_passkey',
        email: operation.replay.session.email,
        body: operation.replay.body,
        status: operation.replay.status,
        session: operation.replay.session,
        failureMessage: 'Failed to create session',
      })
    }

    const result = await verifyPasskeyAuthentication({ request, body })
    if (result.log) console.error(...result.log)
    if (!result.session) return NextResponse.json(result.body, { status: result.status })

    return issueRecoverableSession({
      operation,
      operationKey,
      operationType: 'login_passkey',
      email: result.session.email,
      body: result.body,
      status: result.status,
      session: result.session,
      failureMessage: 'Failed to create session',
    })
  } catch (error) {
    console.error('[passkeys/auth/verify] unhandled error:', error)
    return NextResponse.json({ error: 'Failed to verify passkey' }, { status: 500 })
  }
}
