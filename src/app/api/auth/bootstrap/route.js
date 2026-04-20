/**
 * GET /api/auth/bootstrap
 *
 * Returns the authenticated user plus the profile/security fields needed
 * to hydrate the protected app shell in a single request.
 */

import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@api/_lib/auth.js'
import { bootstrapSession } from '@features/auth/server/bootstrapSession.js'

export async function GET(request) {
  const { userId, email, role, authMethod, error: authError } = requireAuth(request)

  if (authError === 'Token expired') {
    return NextResponse.json({ error: 'Token expired' }, { status: 401 })
  }

  if (authError) {
    return unauthorized(authError)
  }

  const result = await bootstrapSession({ userId, email, role, authMethod })
  if (result.error) console.error(result.log, result.error)
  return NextResponse.json(result.body, { status: result.status })
}
