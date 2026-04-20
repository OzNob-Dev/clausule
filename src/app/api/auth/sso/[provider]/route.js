/**
 * GET /api/auth/sso/[provider]
 *
 * Initiates OAuth 2.0 Authorization Code + PKCE.
 */

import { NextResponse } from 'next/server'
import { createSsoStart } from '@features/auth/server/ssoStart.js'

export async function GET(request, { params }) {
  const { provider } = await params
  const result = createSsoStart({ requestUrl: request.url, provider })

  if (result.body) return NextResponse.json(result.body, { status: result.status })

  const response = NextResponse.redirect(result.redirect)
  if (result.cookie) response.headers.append('Set-Cookie', result.cookie)
  return response
}
