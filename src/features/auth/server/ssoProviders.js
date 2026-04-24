import crypto from 'node:crypto'
import { fetchWithTimeout } from '@api/_lib/network.js'

export async function exchangeSsoCode({ provider, code, codeVerifier, redirectUri, appleUser }) {
  switch (provider) {
    case 'google': return googleExchange({ code, codeVerifier, redirectUri })
    case 'microsoft': return microsoftExchange({ code, codeVerifier, redirectUri })
    case 'apple': return appleExchange({ code, codeVerifier, redirectUri, appleUser })
    default: throw new Error('Unknown provider')
  }
}

async function googleExchange({ code, codeVerifier, redirectUri }) {
  const tokenRes = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code_verifier: codeVerifier,
    }),
  }, { timeoutMs: 10_000, timeoutLabel: 'Google token exchange' })

  if (!tokenRes.ok) throw new Error(`Google token: ${tokenRes.status} ${await tokenRes.text()}`)

  const { access_token } = await tokenRes.json()
  const infoRes = await fetchWithTimeout('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  }, { timeoutMs: 10_000, timeoutLabel: 'Google user info' })

  if (!infoRes.ok) throw new Error(`Google userinfo: ${infoRes.status}`)

  const info = await infoRes.json()
  return {
    email: info.email?.toLowerCase(),
    firstName: info.given_name ?? '',
    lastName: info.family_name ?? '',
    provider: 'google',
    providerId: info.id,
  }
}

async function microsoftExchange({ code, codeVerifier, redirectUri }) {
  const tokenRes = await fetchWithTimeout('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      code_verifier: codeVerifier,
      scope: 'openid email profile User.Read',
    }),
  }, { timeoutMs: 10_000, timeoutLabel: 'Microsoft token exchange' })

  if (!tokenRes.ok) throw new Error(`Microsoft token: ${tokenRes.status} ${await tokenRes.text()}`)

  const { access_token } = await tokenRes.json()
  const infoRes = await fetchWithTimeout(
    'https://graph.microsoft.com/v1.0/me?$select=id,mail,userPrincipalName,givenName,surname',
    { headers: { Authorization: `Bearer ${access_token}` } },
    { timeoutMs: 10_000, timeoutLabel: 'Microsoft user info' }
  )

  if (!infoRes.ok) throw new Error(`Microsoft Graph: ${infoRes.status}`)

  const info = await infoRes.json()
  return {
    email: (info.mail ?? info.userPrincipalName)?.toLowerCase(),
    firstName: info.givenName ?? '',
    lastName: info.surname ?? '',
    provider: 'microsoft',
    providerId: info.id,
  }
}

function buildAppleClientSecret() {
  const teamId = process.env.APPLE_TEAM_ID
  const keyId = process.env.APPLE_KEY_ID
  const clientId = process.env.APPLE_CLIENT_ID
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!teamId || !keyId || !clientId || !privateKey) {
    throw new Error('Apple SSO environment variables not fully configured')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: teamId,
    iat: now,
    exp: now + 180 * 24 * 60 * 60,
    aud: 'https://appleid.apple.com',
    sub: clientId,
  })).toString('base64url')

  const data = `${header}.${payload}`
  const sign = crypto.createSign('SHA256')
  sign.update(data)
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
  const tokenRes = await fetchWithTimeout('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.APPLE_CLIENT_ID,
      client_secret: buildAppleClientSecret(),
      code_verifier: codeVerifier,
    }),
  }, { timeoutMs: 10_000, timeoutLabel: 'Apple token exchange' })

  if (!tokenRes.ok) throw new Error(`Apple token: ${tokenRes.status} ${await tokenRes.text()}`)

  const tokens = await tokenRes.json()
  const idClaims = decodeJwtPayload(tokens.id_token)

  return {
    email: idClaims?.email?.toLowerCase(),
    firstName: appleUser?.name?.firstName ?? '',
    lastName: appleUser?.name?.lastName ?? '',
    provider: 'apple',
    providerId: idClaims?.sub,
  }
}
