/**
 * POST /api/auth/passkeys/register/verify
 *
 * Verifies the WebAuthn registration response and persists the credential.
 */

import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@api/_lib/auth.js'
import { verifyPasskeyRegistration } from '@features/auth/server/passkeyRegistration.js'

export async function POST(request) {
  try {
    const { userId, error: authError } = await requireAuth(request)
    if (authError) return unauthorized()

    const result = await verifyPasskeyRegistration({
      request,
      userId,
      body: await request.json().catch(() => ({})),
    })

    if (result.log) console.error(...result.log)
    return NextResponse.json(result.body, { status: result.status })
  } catch (err) {
    console.error('[passkeys/register/verify] unhandled error:', err)
    return NextResponse.json({ error: 'Failed to verify passkey' }, { status: 500 })
  }
}
