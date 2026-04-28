/**
 * GET /api/auth/bootstrap
 *
 * Returns the authenticated user plus the profile/security fields needed
 * to hydrate the protected app shell in a single request.
 */

import { NextResponse } from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'
import { bootstrapSession } from '@auth/server/bootstrapSession.js'
import { authTestBypassBootstrap, isAuthTestBypassEnabled } from '@shared/utils/authTestBypass.js'

export async function GET(request) {
  if (isAuthTestBypassEnabled()) {
    return NextResponse.json(authTestBypassBootstrap)
  }

  const { userId, email, role, authMethod, error: authError } = await requireActiveAuth(request)

  if (authError === 'Token expired') {
    return NextResponse.json({ error: 'Token expired' }, { status: 401 })
  }

  if (authError) {
    return authErrorResponse(authError)
  }

  const result = await bootstrapSession({ userId, email, role, authMethod })
  return NextResponse.json(result.body, { status: result.status })
}
