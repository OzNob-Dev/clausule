import crypto from 'node:crypto'

const CHALLENGE_TTL_MS = 5 * 60 * 1000

function challengeSecret() {
  const secret = process.env.WEBAUTHN_CHALLENGE_SECRET || process.env.JWT_SECRET
  if (!secret) throw new Error('WEBAUTHN_CHALLENGE_SECRET or JWT_SECRET must be set')
  return secret
}

export function getRpName() {
  return process.env.NEXT_PUBLIC_RP_NAME ?? 'Clausule'
}

export function getChallengeTtlMs() {
  return CHALLENGE_TTL_MS
}

export function getRpId(request) {
  if (process.env.NEXT_PUBLIC_RP_ID) return process.env.NEXT_PUBLIC_RP_ID
  const host = request.headers.get('host') ?? 'localhost'
  return host.split(':')[0]
}

export function getExpectedOrigin(request) {
  if (process.env.NEXT_PUBLIC_ORIGIN) return process.env.NEXT_PUBLIC_ORIGIN
  const host = request.headers.get('host') ?? 'localhost:3000'
  const proto = /^(localhost|127\.|0\.0\.0\.0)/.test(host) ? 'http' : 'https'
  return `${proto}://${host}`
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
