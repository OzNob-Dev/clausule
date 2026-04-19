/**
 * GET|POST /api/auth/sso/[provider]/callback
 *
 * Handles the OAuth 2.0 callback from Google, Microsoft, and Apple.
 * Apple uses response_mode=form_post → POST; Google/Microsoft use GET.
 *
 * Flow:
 *  1. Extract `code` + `state` from query string (GET) or form body (POST/Apple)
 *  2. Validate state against the sso_state httpOnly cookie (CSRF check)
 *  3. Exchange authorization code for tokens using PKCE code_verifier
 *  4. Fetch user info (email, given_name, family_name) from provider
 *  5. Upsert profile row in Supabase (creates user if first sign-in)
 *  6. Issue JWT access token + opaque refresh token as httpOnly cookies
 *  7. Redirect to /dashboard or /brag based on role
 *
 * On any error: redirect to /?sso_error=<reason>
 */

import { NextResponse }                          from 'next/server'
import crypto                                    from 'node:crypto'
import { select }                                from '@api/_lib/supabase.js'
import { createPersistentSession,
         appendSessionCookies }                  from '@api/_lib/session.js'
import { clearAuthCookies }                      from '@api/_lib/auth.js'

// ── Entry points ──────────────────────────────────────────────────────────────

export async function GET(request, { params }) {
  const { provider } = await params
  const url   = new URL(request.url)
  const code  = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return redirect(url.origin, `sso_denied`)
  }

  return handleCallback({ request, provider, code, state, appleUser: null })
}

export async function POST(request, { params }) {
  const { provider } = await params
  const formData   = await request.formData().catch(() => new FormData())
  const code       = formData.get('code')
  const state      = formData.get('state')
  const error      = formData.get('error')

  if (error) {
    const origin = new URL(request.url).origin
    return redirect(origin, 'sso_denied')
  }

  // Apple sends user JSON only on the first authorization
  let appleUser = null
  const userParam = formData.get('user')
  if (userParam) {
    try { appleUser = JSON.parse(userParam) } catch {}
  }

  return handleCallback({ request, provider, code, state, appleUser })
}

// ── Core handler ──────────────────────────────────────────────────────────────

async function handleCallback({ request, provider, code, state, appleUser }) {
  const origin = new URL(request.url).origin

  if (!code || !state) return redirect(origin, 'missing_params')

  // ── 1. Validate CSRF state from cookie ────────────────────────────────────
  const cookieHeader = request.headers.get('cookie') ?? ''
  const rawCookie    = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('sso_state='))

  if (!rawCookie) return redirect(origin, 'state_mismatch')

  let stored
  try {
    stored = JSON.parse(decodeURIComponent(rawCookie.split('=').slice(1).join('=')))
  } catch {
    return redirect(origin, 'invalid_state')
  }

  if (stored.state !== state || stored.provider !== provider) {
    return redirect(origin, 'state_mismatch')
  }

  // ── 2. Exchange code for user profile ─────────────────────────────────────
  const redirectUri = `${origin}/api/auth/sso/${provider}/callback`
  let userInfo

  try {
    userInfo = await exchangeCode({
      provider,
      code,
      codeVerifier: stored.codeVerifier,
      redirectUri,
      appleUser,
    })
  } catch (err) {
    console.error(`[sso/${provider}] token exchange:`, err.message)
    return redirect(origin, 'token_exchange_failed')
  }

  if (!userInfo?.email) return redirect(origin, 'no_email')

  // ── 3. Check for existing paid account ───────────────────────────────────
  let existingProfile
  try {
    const { data } = await select(
      'profiles',
      new URLSearchParams({
        email:  `ilike.${userInfo.email}`,
        select: 'id,role,first_name,last_name,is_active,is_deleted',
        limit:  '1',
      }).toString()
    )
    existingProfile = data?.[0] ?? null
  } catch (err) {
    console.error(`[sso/${provider}] profile lookup:`, err.message)
    return redirect(origin, 'account_error')
  }

  // New user — send to signup with SSO data prefilled so they complete payment
  if (!existingProfile) {
    return redirectToSignup(origin, provider, userInfo)
  }

  let hasPaid = false
  try {
    const { data } = await select(
      'subscriptions',
      new URLSearchParams({
        user_id: 'eq.' + existingProfile.id,
        status:  'in.(active,trialing)',
        select:  'id',
        limit:   '1',
      }).toString()
    )
    hasPaid = Array.isArray(data) && data.length > 0
  } catch (err) {
    console.error(`[sso/${provider}] subscription lookup:`, err.message)
    return redirect(origin, 'account_error')
  }

  const isActive = Boolean(existingProfile.is_active) || hasPaid
  if (!isActive || existingProfile.is_deleted) {
    return redirectToSignup(origin, provider, {
      email: userInfo.email,
      firstName: userInfo.firstName || existingProfile.first_name || '',
      lastName: userInfo.lastName || existingProfile.last_name || '',
    })
  }

  // ── 4. Existing user — issue session ──────────────────────────────────────
  try {
    const { id: userId, role = 'employee' } = existingProfile
    const dest = `${origin}${role === 'employee' ? '/brag' : '/dashboard'}`
    const res  = NextResponse.redirect(dest)

    res.headers.append('Set-Cookie', 'sso_state=; HttpOnly; Path=/; Max-Age=0')

    const session = await createPersistentSession({ userId, email: userInfo.email, role, authMethod: 'sso' })
    return appendSessionCookies(res, session)
  } catch (err) {
    console.error(`[sso/${provider}] session creation:`, err.message)
    return redirect(origin, 'account_error')
  }
}

// ── Provider token exchanges ──────────────────────────────────────────────────

async function exchangeCode({ provider, code, codeVerifier, redirectUri, appleUser }) {
  switch (provider) {
    case 'google':    return googleExchange({ code, codeVerifier, redirectUri })
    case 'microsoft': return microsoftExchange({ code, codeVerifier, redirectUri })
    case 'apple':     return appleExchange({ code, codeVerifier, redirectUri, appleUser })
    default: throw new Error('Unknown provider')
  }
}

async function googleExchange({ code, codeVerifier, redirectUri }) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    throw new Error(`Google token: ${tokenRes.status} ${await tokenRes.text()}`)
  }

  const { access_token } = await tokenRes.json()

  const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!infoRes.ok) throw new Error(`Google userinfo: ${infoRes.status}`)

  const info = await infoRes.json()
  return {
    email:      info.email?.toLowerCase(),
    firstName:  info.given_name  ?? '',
    lastName:   info.family_name ?? '',
    provider:   'google',
    providerId: info.id,
  }
}

async function microsoftExchange({ code, codeVerifier, redirectUri }) {
  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      code_verifier: codeVerifier,
      scope:         'openid email profile User.Read',
    }),
  })

  if (!tokenRes.ok) {
    throw new Error(`Microsoft token: ${tokenRes.status} ${await tokenRes.text()}`)
  }

  const { access_token } = await tokenRes.json()

  // givenName/surname from Graph; mail may be null for personal accounts → fall back to userPrincipalName
  const infoRes = await fetch(
    'https://graph.microsoft.com/v1.0/me?$select=id,mail,userPrincipalName,givenName,surname',
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!infoRes.ok) throw new Error(`Microsoft Graph: ${infoRes.status}`)

  const info = await infoRes.json()
  return {
    email:      (info.mail ?? info.userPrincipalName)?.toLowerCase(),
    firstName:  info.givenName ?? '',
    lastName:   info.surname   ?? '',
    provider:   'microsoft',
    providerId: info.id,
  }
}

// Apple client_secret is a short-lived ES256 JWT signed with the app's private key
function buildAppleClientSecret() {
  const teamId     = process.env.APPLE_TEAM_ID
  const keyId      = process.env.APPLE_KEY_ID
  const clientId   = process.env.APPLE_CLIENT_ID
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!teamId || !keyId || !clientId || !privateKey) {
    throw new Error('Apple SSO environment variables not fully configured')
  }

  const now     = Math.floor(Date.now() / 1000)
  const header  = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: teamId,
    iat: now,
    exp: now + 180 * 24 * 60 * 60, // 180-day max
    aud: 'https://appleid.apple.com',
    sub: clientId,
  })).toString('base64url')

  const data = `${header}.${payload}`
  const sign = crypto.createSign('SHA256')
  sign.update(data)
  // ieee-p1363 encoding gives the fixed-length r||s format required by JWT ES256
  const sig = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')

  return `${data}.${sig}`
}

function decodeJwtPayload(token) {
  try {
    const parts = (token ?? '').split('.')
    if (parts.length < 2) return null
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

async function appleExchange({ code, codeVerifier, redirectUri, appleUser }) {
  const clientSecret = buildAppleClientSecret()

  const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     process.env.APPLE_CLIENT_ID,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    throw new Error(`Apple token: ${tokenRes.status} ${await tokenRes.text()}`)
  }

  const tokens       = await tokenRes.json()
  const idClaims     = decodeJwtPayload(tokens.id_token)
  const email        = idClaims?.email?.toLowerCase()

  // Apple only sends name on the very first authorization via the form_post `user` field
  const firstName = appleUser?.name?.firstName ?? ''
  const lastName  = appleUser?.name?.lastName  ?? ''

  return {
    email,
    firstName,
    lastName,
    provider:   'apple',
    providerId: idClaims?.sub,
  }
}


// ── Util ──────────────────────────────────────────────────────────────────────

function redirect(origin, errorCode) {
  return NextResponse.redirect(`${origin}/?sso_error=${encodeURIComponent(errorCode)}`)
}

function redirectToSignup(origin, provider, userInfo) {
  const params = new URLSearchParams({ email: userInfo.email, sso: provider })
  if (userInfo.firstName) params.set('firstName', userInfo.firstName)
  if (userInfo.lastName) params.set('lastName', userInfo.lastName)

  const res = NextResponse.redirect(`${origin}/signup?${params}`)
  res.headers.append('Set-Cookie', 'sso_state=; HttpOnly; Path=/; Max-Age=0')
  clearAuthCookies().forEach((cookie) => res.headers.append('Set-Cookie', cookie))
  return res
}
