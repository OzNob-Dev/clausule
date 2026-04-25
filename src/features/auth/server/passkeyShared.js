import crypto from 'node:crypto'

const CHALLENGE_TTL_MS = 5 * 60 * 1000

function challengeSecret() {
  const secret = process.env.WEBAUTHN_CHALLENGE_SECRET || process.env.JWT_SECRET
  if (!secret) throw new Error('WEBAUTHN_CHALLENGE_SECRET or JWT_SECRET must be set')
  return secret
}

function requestHost(request) {
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  return forwardedHost || request.headers.get('host') || 'localhost'
}

function requestHostName(request) {
  return requestHost(request).split(':')[0]
}

function requestProtocol(request) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  if (forwardedProto) return forwardedProto

  try {
    return new URL(request.url).protocol.replace(':', '')
  } catch {
    return 'https'
  }
}

function localHost(hostname) {
  return /^(localhost|127\.|0\.0\.0\.0)/.test(hostname)
}

function allowRequestDerivedOrigin(request) {
  const hostname = requestHostName(request)
  return process.env.NODE_ENV !== 'production' || localHost(hostname)
}

export function getRpName() {
  return process.env.NEXT_PUBLIC_RP_NAME ?? 'Clausule'
}

export function getChallengeTtlMs() {
  return CHALLENGE_TTL_MS
}

export function getRpId(request) {
  if (process.env.NEXT_PUBLIC_RP_ID) return process.env.NEXT_PUBLIC_RP_ID
  if (allowRequestDerivedOrigin(request)) return requestHostName(request)
  throw new Error('NEXT_PUBLIC_RP_ID must be configured for WebAuthn in production')
}

export function getExpectedOrigin(request) {
  if (process.env.NEXT_PUBLIC_ORIGIN) return process.env.NEXT_PUBLIC_ORIGIN
  if (allowRequestDerivedOrigin(request)) return `${requestProtocol(request)}://${requestHost(request)}`
  throw new Error('NEXT_PUBLIC_ORIGIN must be configured for WebAuthn in production')
}

export function signChallenge(challengeBytes) {
  const b64 = challengeBytes.toString('base64url')
  const sig = crypto.createHmac('sha256', challengeSecret()).update(b64).digest('base64url')
  return `${b64}.${sig}`
}

export function verifySignedChallenge(signedChallenge) {
  const dotIdx = String(signedChallenge ?? '').lastIndexOf('.')
  if (dotIdx === -1) return null

  const b64 = signedChallenge.slice(0, dotIdx)
  const sig = signedChallenge.slice(dotIdx + 1)
  const expected = crypto.createHmac('sha256', challengeSecret()).update(b64).digest('base64url')

  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ? b64
    : null
}

export function fromB64url(str) {
  return Buffer.from(str, 'base64url')
}

export function jsonError(error, status = 400) {
  return { body: { error }, status }
}
