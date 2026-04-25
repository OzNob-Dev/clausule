import crypto from 'node:crypto'
import { fetchWithTimeout } from '@api/_lib/network.js'

const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys'
const APPLE_KEYS_TTL_MS = 60 * 60 * 1000

let appleKeysCache = {
  expiresAt: 0,
  keys: null,
}

export function resetAppleKeysCacheForTest() {
  appleKeysCache = { expiresAt: 0, keys: null }
}

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

function parseJwt(token) {
  const parts = String(token ?? '').split('.')
  if (parts.length !== 3) throw new Error('Invalid Apple identity token')

  const [headerPart, payloadPart, signaturePart] = parts
  let header
  let payload
  try {
    header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'))
    payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'))
  } catch {
    throw new Error('Invalid Apple identity token')
  }

  return {
    header,
    payload,
    signature: Buffer.from(signaturePart, 'base64url'),
    signingInput: Buffer.from(`${headerPart}.${payloadPart}`),
  }
}

async function appleSigningKeys() {
  if (appleKeysCache.keys && appleKeysCache.expiresAt > Date.now()) return appleKeysCache.keys

  const response = await fetchWithTimeout(APPLE_KEYS_URL, {}, {
    timeoutMs: 10_000,
    timeoutLabel: 'Apple signing keys',
  })
  if (!response.ok) throw new Error(`Apple keys: ${response.status}`)

  const payload = await response.json()
  if (!Array.isArray(payload?.keys) || payload.keys.length === 0) {
    throw new Error('Apple keys response invalid')
  }

  appleKeysCache = {
    expiresAt: Date.now() + APPLE_KEYS_TTL_MS,
    keys: payload.keys,
  }
  return appleKeysCache.keys
}

async function verifyAppleIdentityToken(idToken) {
  const parsed = parseJwt(idToken)
  if (parsed.header.alg !== 'ES256' || !parsed.header.kid) {
    throw new Error('Apple identity token header invalid')
  }

  const keys = await appleSigningKeys()
  const jwk = keys.find((key) => key.kid === parsed.header.kid && key.kty === 'EC')
  if (!jwk) throw new Error('Apple signing key not found')

  const valid = crypto.verify(
    'sha256',
    parsed.signingInput,
    { key: crypto.createPublicKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' },
    parsed.signature
  )
  if (!valid) throw new Error('Apple identity token signature invalid')

  const now = Math.floor(Date.now() / 1000)
  const clientId = process.env.APPLE_CLIENT_ID
  const emailVerified = parsed.payload.email_verified === true || parsed.payload.email_verified === 'true'
  if (parsed.payload.iss !== 'https://appleid.apple.com') throw new Error('Apple identity token issuer invalid')
  if (parsed.payload.aud !== clientId) throw new Error('Apple identity token audience invalid')
  if (!parsed.payload.sub || parsed.payload.exp <= now) throw new Error('Apple identity token expired')
  if (!parsed.payload.email || !emailVerified) throw new Error('Apple identity token email invalid')

  return parsed.payload
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
  const idClaims = await verifyAppleIdentityToken(tokens.id_token)

  return {
    email: idClaims?.email?.toLowerCase(),
    firstName: appleUser?.name?.firstName ?? '',
    lastName: appleUser?.name?.lastName ?? '',
    provider: 'apple',
    providerId: idClaims?.sub,
  }
}
