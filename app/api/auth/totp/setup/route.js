/**
 * /api/auth/totp/setup
 *
 * GET  — generate a new TOTP secret for the authenticated user.
 *        Returns the base32 secret and an otpauth:// URI for QR rendering.
 *        Response 200: { secret: string, uri: string }
 *
 * POST — verify a TOTP code against a provisioned secret and activate it.
 *        Body: { code: string, secret: string }
 *        Response 200: { ok: true }
 *
 * TOTP is implemented without external deps using Node.js built-in crypto.
 * Algorithm: RFC 6238 — HMAC-SHA1, 6 digits, 30-second window.
 */

import { NextResponse }               from 'next/server'
import crypto                         from 'node:crypto'
import { requireAuth, unauthorized }  from '@api/_lib/auth.js'
import { update, select }             from '@api/_lib/supabase.js'

// ── Base32 helpers ────────────────────────────────────────────────────────────

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/**
 * Generate a cryptographically random base32 string (160-bit = 32 chars).
 */
function generateBase32Secret() {
  const bytes = crypto.randomBytes(20)
  let result  = ''
  let buffer  = 0
  let bitsLeft = 0

  for (const byte of bytes) {
    buffer    = (buffer << 8) | byte
    bitsLeft += 8
    while (bitsLeft >= 5) {
      bitsLeft -= 5
      result   += BASE32_CHARS[(buffer >> bitsLeft) & 0x1f]
    }
  }
  if (bitsLeft > 0) {
    result += BASE32_CHARS[(buffer << (5 - bitsLeft)) & 0x1f]
  }
  return result
}

/**
 * Decode a base32 string to a Buffer.
 */
function base32Decode(input) {
  const str    = input.toUpperCase().replace(/=+$/, '')
  const bytes  = []
  let buffer   = 0
  let bitsLeft = 0

  for (const char of str) {
    const val = BASE32_CHARS.indexOf(char)
    if (val === -1) continue
    buffer    = (buffer << 5) | val
    bitsLeft += 5
    if (bitsLeft >= 8) {
      bitsLeft -= 8
      bytes.push((buffer >> bitsLeft) & 0xff)
    }
  }
  return Buffer.from(bytes)
}

// ── TOTP (RFC 6238) ───────────────────────────────────────────────────────────

/**
 * Compute a TOTP code for the given base32 secret and time counter.
 * @param {string} secret - base32-encoded secret
 * @param {number} counter - TOTP time step (floor(unix_time / 30))
 * @returns {string} 6-digit code
 */
function totpCode(secret, counter) {
  const key     = base32Decode(secret)
  const message = Buffer.alloc(8)
  // Write 64-bit big-endian counter.
  let c = counter
  for (let i = 7; i >= 0; i--) {
    message[i] = c & 0xff
    c          = Math.floor(c / 256)
  }

  const hmac  = crypto.createHmac('sha1', key).update(message).digest()
  const offset = hmac[19] & 0x0f
  const code   =
    ((hmac[offset]     & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) <<  8) |
     (hmac[offset + 3] & 0xff)

  return String(code % 1_000_000).padStart(6, '0')
}

/**
 * Verify a TOTP code allowing ±1 time step (±30 s) for clock skew.
 * @param {string} secret
 * @param {string} code
 * @returns {boolean}
 */
function verifyTotp(secret, code) {
  const counter = Math.floor(Date.now() / 1000 / 30)
  for (const delta of [-1, 0, 1]) {
    if (totpCode(secret, counter + delta) === code) return true
  }
  return false
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  // Fetch the user's email for the otpauth URI label.
  let email = 'user'
  try {
    const { data: profiles } = await select('profiles', `id=eq.${userId}&select=email&limit=1`)
    if (profiles?.[0]?.email) email = profiles[0].email
  } catch { /* non-fatal */ }

  const secret = generateBase32Secret()
  const uri    = `otpauth://totp/Clausule:${encodeURIComponent(email)}?secret=${secret}&issuer=Clausule&algorithm=SHA1&digits=6&period=30`

  // Return the secret temporarily; it is only persisted after verification in POST.
  return NextResponse.json({ secret, uri })
}

export async function POST(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const body   = await request.json().catch(() => ({}))
  const code   = (body.code   ?? '').replace(/\D/g, '').slice(0, 6)
  const secret = (body.secret ?? '').trim().toUpperCase()

  if (code.length !== 6 || !secret) {
    return NextResponse.json({ error: 'code (6 digits) and secret are required' }, { status: 400 })
  }

  if (!verifyTotp(secret, code)) {
    return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 401 })
  }

  // Persist the TOTP secret to the user's profile.
  // The schema does not yet have a totp_secret column — add it via migration:
  //   ALTER TABLE profiles ADD COLUMN totp_secret text;
  const { error: updateError } = await update(
    'profiles',
    `id=eq.${userId}`,
    { totp_secret: secret }
  )

  if (updateError) {
    console.error('[totp/setup POST] update error:', updateError)
    return NextResponse.json({ error: 'Failed to save TOTP configuration' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
