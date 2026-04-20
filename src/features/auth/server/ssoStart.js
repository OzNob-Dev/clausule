import crypto from 'node:crypto'

const PROVIDERS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'openid email profile User.Read',
    clientId: () => process.env.MICROSOFT_CLIENT_ID,
  },
  apple: {
    authUrl: 'https://appleid.apple.com/auth/authorize',
    scope: 'name email',
    clientId: () => process.env.APPLE_CLIENT_ID,
    responseMode: 'form_post',
  },
}

export function createSsoStart({ requestUrl, provider }) {
  const config = PROVIDERS[provider]
  const origin = new URL(requestUrl).origin

  if (!config) return { body: { error: 'Unknown provider' }, status: 400 }

  const clientId = config.clientId()
  if (!clientId) return { redirect: `${origin}/?sso_error=not_configured` }

  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const state = crypto.randomBytes(16).toString('hex')
  const redirectUri = `${origin}/api/auth/sso/${provider}/callback`
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  if (config.responseMode) query.set('response_mode', config.responseMode)

  const isSecure = requestUrl.startsWith('https')
  const cookieVal = encodeURIComponent(JSON.stringify({ state, codeVerifier, provider }))

  return {
    redirect: `${config.authUrl}?${query}`,
    cookie: `sso_state=${cookieVal}; HttpOnly; SameSite=${isSecure ? 'None' : 'Lax'}; Path=/; Max-Age=300${isSecure ? '; Secure' : ''}`,
  }
}
