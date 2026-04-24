/**
 * POST /api/auth/passkeys/register/options
 *
 * Returns WebAuthn PublicKeyCredentialCreationOptions for registration.
 */

import { NextResponse } from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { createPasskeyRegistrationOptions } from '@features/auth/server/passkeyRegistration.js'

export async function POST(request) {
  const { userId, error: authError } = await requireActiveAuth(request)
  if (authError) return authErrorResponse(authError)

  const result = await createPasskeyRegistrationOptions({ request, userId })
  return NextResponse.json(result.body, { status: result.status })
}
