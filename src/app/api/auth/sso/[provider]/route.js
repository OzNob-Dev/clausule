/**
 * GET /api/auth/sso/[provider]
 *
 * Initiates OAuth 2.0 Authorization Code + PKCE.
 */

import { NextResponse } from 'next/server'
import { createSsoStart } from '@auth/server/ssoStart.js'

export async function GET(request, { params }) {
  const { provider } = await params
  const result = await createSsoStart({ requestUrl: request.url, provider })

  if (result.body) return NextResponse.json(result.body, { status: result.status })

  const response = NextResponse.redirect(result.redirect)
  return response
}
