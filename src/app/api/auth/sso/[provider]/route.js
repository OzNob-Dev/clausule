/**
 * GET /api/auth/sso/[provider]
 *
 * Initiates the OAuth 2.0 Authorization Code + PKCE flow.
 * Supported providers: google | microsoft | apple
 *
 * 1. Generates a PKCE code_verifier + code_challenge (S256)
 * 2. Generates a CSRF state token
 * 3. Stores both in a short-lived httpOnly cookie (5 min)
 * 4. Redirects the browser to the provider's auth URL
 */

import { NextResponse } from 'next/server'
import crypto           from 'node:crypto'

const PROVIDERS = {
  google: {
    authUrl:  'https://accounts.google.com/o/oauth2/v2/auth',
    scope:    'openid email profile',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
  },
  microsoft: {
    authUrl:  'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope:    'openid email profile User.Read',
    clientId: () => process.env.MICROSOFT_CLIENT_ID,
  },
  apple: {
    authUrl:      'https://appleid.apple.com/auth/authorize',
    scope:        'name email',
    clientId:     () => process.env.APPLE_CLIENT_ID,
    responseMode: 'form_post',
  },
}

export async function GET(request, { params }) {
  const { provider } = await params
  const config = PROVIDERS[provider]

  if (!config) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  }

  const clientId = config.clientId()
  const origin   = new URL(request.url).origin

  if (!clientId) {
    return NextResponse.redirect(`${origin}/?sso_error=not_configured`)
  }

  const redirectUri = `${origin}/api/auth/sso/${provider}/callback`

  // PKCE — code_verifier is 32 random bytes base64url-encoded
  const codeVerifier  = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')

  // CSRF state
  const state = crypto.randomBytes(16).toString('hex')

  const query = new URLSearchParams({
    client_id:             clientId,
    redirect_uri:          redirectUri,
    response_type:         'code',
    scope:                 config.scope,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })

  if (config.responseMode) query.set('response_mode', config.responseMode)

  const response = NextResponse.redirect(`${config.authUrl}?${query}`)

  // Store state + verifier in httpOnly cookie (5 min TTL)
  // SameSite=None required for Apple's form_post cross-site redirect
  const isSecure  = request.url.startsWith('https')
  const sameSite  = isSecure ? 'None' : 'Lax'
  const secure    = isSecure ? '; Secure' : ''
  const cookieVal = encodeURIComponent(JSON.stringify({ state, codeVerifier, provider }))

  response.headers.append(
    'Set-Cookie',
    `sso_state=${cookieVal}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=300${secure}`
  )

  return response
}
