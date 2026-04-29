import crypto from 'node:crypto'
import { rpc } from '@api/_lib/supabase.js'

const SSO_STATE_COOKIE = 'sso_state'
const IS_PROD = process.env.NODE_ENV === 'production'

function firstRow(data) {
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}

function ssoStateSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return Buffer.from(secret)
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function parseCookie(header, name) {
  const match = String(header ?? '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

function signSsoStatePayload(payload) {
  const body = base64urlJson(payload)
  const signature = crypto.createHmac('sha256', ssoStateSecret()).update(body).digest('base64url')
  return `${body}.${signature}`
}

function verifySsoStatePayload(token) {
  const [body, signature] = String(token ?? '').split('.')
  if (!body || !signature) return null

  const expected = crypto.createHmac('sha256', ssoStateSecret()).update(body).digest('base64url')
  const signatureBuffer = Buffer.from(signature, 'base64url')
  const expectedBuffer = Buffer.from(expected, 'base64url')
  if (
    signatureBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export async function createSsoAuthState({ state, provider, codeVerifier, redirectOrigin, expiresAt }) {
  return rpc('create_sso_auth_state', {
    p_state: state,
    p_provider: provider,
    p_code_verifier: codeVerifier,
    p_redirect_origin: redirectOrigin,
    p_expires_at: expiresAt,
  }, { expectRows: 'single' })
}

export async function consumeSsoAuthState({ state, provider }) {
  const { data, error } = await rpc('consume_sso_auth_state', {
    p_state: state,
    p_provider: provider,
    p_now: new Date().toISOString(),
  }, { expectRows: 'single' })

  if (error?.code === 'PGRST_NO_ROWS') return { row: null, error: null }
  if (error) return { row: null, error }
  return { row: firstRow(data), error: null }
}

export function createSsoStateCookie({ state, provider, codeVerifier, redirectOrigin, expiresAt }) {
  const value = signSsoStatePayload({
    state,
    provider,
    codeVerifier,
    redirectOrigin,
    expiresAt,
  })
  return `${SSO_STATE_COOKIE}=${encodeURIComponent(value)}; Max-Age=300; Path=/; HttpOnly; SameSite=Lax; Priority=High${IS_PROD ? '; Secure' : ''}`
}

export function consumeSsoStateCookie({ cookieHeader, state, provider, now = new Date().toISOString() }) {
  const token = parseCookie(cookieHeader, SSO_STATE_COOKIE)
  if (!token) return { row: null, error: null }

  const payload = verifySsoStatePayload(token)
  if (!payload) return { row: null, error: null }
  if (payload.state !== state || payload.provider !== provider) return { row: null, error: null }
  if (!payload.codeVerifier || !payload.redirectOrigin || !payload.expiresAt) return { row: null, error: null }
  if (new Date(payload.expiresAt).getTime() <= new Date(now).getTime()) return { row: null, error: null }

  return {
    row: {
      code_verifier: payload.codeVerifier,
      redirect_origin: payload.redirectOrigin,
    },
    error: null,
  }
}
