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
  if (result.warning) console.error(`[sso/${provider}] state store fallback:`, result.warning.message ?? result.warning)
  if (result.stateCookie) response.headers.append('Set-Cookie', result.stateCookie)
  return response
}
