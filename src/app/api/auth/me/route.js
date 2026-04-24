/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's profile decoded from the access token cookie.
 * On expired token the client should call POST /api/auth/refresh then retry.
 *
 * 200: { user: { id: string, email: string, role: string } }
 * 401: { error: string }
 */

import { NextResponse }              from 'next/server'
import { authErrorResponse, requireActiveAuth } from '@api/_lib/auth.js'

export async function GET(request) {
  const { userId, email, role, error } = await requireActiveAuth(request)

  if (error === 'Token expired') {
    return NextResponse.json({ error: 'Token expired' }, { status: 401 })
  }

  if (error) {
    return authErrorResponse(error)
  }

  return NextResponse.json({ user: { id: userId, email, role } })
}
