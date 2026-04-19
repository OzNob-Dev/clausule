/**
 * JWT utilities — HS256 via Node.js built-in crypto (no external deps).
 *
 * Access token  : signed JWT, 15-minute TTL, verified locally on every request.
 * Refresh token : 32-byte random opaque token, stored as SHA-256 hash in DB,
 *                 rotated on every use (refresh token rotation).
 *
 * Required env var:
 *   JWT_SECRET  — min 32 random bytes, base64 or plain string.
 *                 Generate: node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
 *
 * JWT payload claims:
 *   sub   {string}  user UUID
 *   email {string}  user email
 *   role  {string}  'employee' | 'manager'
 *   amr   {string}  auth method: 'otp' | 'totp' | 'sso' | 'unknown'
 *   jti   {string}  unique token ID (for future revocation)
 *   iat   {number}  issued-at (Unix seconds)
 *   exp   {number}  expiry    (Unix seconds)
 *   type  {string}  'access'
 */

import crypto from 'node:crypto'

// ── Constants ─────────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_TTL_S  = 15 * 60           // 15 minutes
export const REFRESH_TOKEN_TTL_S = 30 * 24 * 60 * 60 // 30 days

// ── Internal helpers ──────────────────────────────────────────────────────────

function getSecret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET environment variable is not set')
  return Buffer.from(s)
}

function b64url(buf) {
  return (Buffer.isBuffer(buf) ? buf : Buffer.from(buf))
    .toString('base64url')
}

function fromB64url(str) {
  return Buffer.from(str, 'base64url')
}

// ── Access token (JWT) ────────────────────────────────────────────────────────

/**
 * Sign a new access token.
 *
 * @param {{ userId: string, email: string, role: string, authMethod?: string }} claims
 * @returns {string} compact JWT
 */
export function signAccessToken({ userId, email, role, authMethod = 'unknown' }) {
  const now = Math.floor(Date.now() / 1000)

  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    sub:   userId,
    email,
    role,
    amr:   authMethod,
    jti:   crypto.randomBytes(16).toString('hex'),
    iat:   now,
    exp:   now + ACCESS_TOKEN_TTL_S,
    type:  'access',
  }))

  const data = `${header}.${payload}`
  const sig  = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url')

  return `${data}.${sig}`
}

/**
 * Verify and decode an access token.
 * Throws on invalid signature, wrong type, or expiry.
 *
 * @param {string} token
 * @returns {{ sub: string, email: string, role: string, amr: string, jti: string, exp: number }}
 */
export function verifyAccessToken(token) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Malformed token')

  const [header, payload, sig] = parts
  const data = `${header}.${payload}`

  // Constant-time signature check.
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url')

  const sigBuf      = fromB64url(sig)
  const expectedBuf = fromB64url(expected)

  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new Error('Invalid token signature')
  }

  let claims
  try {
    claims = JSON.parse(fromB64url(payload).toString('utf8'))
  } catch {
    throw new Error('Malformed token payload')
  }

  if (claims.type !== 'access') throw new Error('Wrong token type')

  const now = Math.floor(Date.now() / 1000)
  if (claims.exp <= now) throw new Error('Token expired')

  return claims
}

// ── Refresh token (opaque) ────────────────────────────────────────────────────

/**
 * Generate a cryptographically random opaque refresh token.
 * Returns both the plaintext (set in cookie) and its SHA-256 hash (stored in DB).
 *
 * @returns {{ token: string, hash: string }}
 */
export function generateRefreshToken() {
  const token = crypto.randomBytes(32).toString('base64url')
  const hash  = crypto.createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

/**
 * Hash a refresh token for DB lookup.
 * @param {string} token
 * @returns {string}
 */
export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
