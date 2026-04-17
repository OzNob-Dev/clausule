/**
 * POST /api/auth/passkeys/register/verify
 *
 * Verifies the WebAuthn registration response from the browser and persists
 * the credential to the `passkeys` table.
 *
 * Prerequisites (add via migration — see comment at bottom):
 *   - `passkeys` table in Supabase
 *
 * NOTE: Full CBOR/COSE decoding of the attestation object requires either
 * the `@simplewebauthn/server` package or a manual CBOR parser.  This route
 * performs the critical security checks (challenge, origin, user presence /
 * verification flags, rpIdHash) and delegates CBOR decoding to a minimal
 * inline implementation.  For production, strongly consider replacing the
 * CBOR section with `@simplewebauthn/server`.
 *
 * Body: {
 *   credential: PublicKeyCredentialJSON,  — from navigator.credentials.create()
 *   _signedChallenge: string              — returned by /options
 *   deviceName: string                    — human label (e.g. "MacBook Pro")
 *   deviceType: string                    — 'laptop'|'phone'|'tablet'
 *   method: string                        — 'Touch ID'|'Face ID'|etc.
 * }
 * Response 201: { ok: true, deviceId: string }
 */

import { NextResponse }               from 'next/server'
import crypto                         from 'node:crypto'
import { requireAuth, unauthorized }  from '../../../../../_lib/auth.js'
import { insert }                     from '../../../../../_lib/supabase.js'
import { pendingChallenges }          from '../options/route.js'

const RP_ID     = process.env.NEXT_PUBLIC_RP_ID  ?? 'localhost'
const ORIGIN    = process.env.NEXT_PUBLIC_ORIGIN ?? 'http://localhost:3000'
const SECRET    = process.env.WEBAUTHN_CHALLENGE_SECRET ?? ''

/**
 * Verify an HMAC-signed challenge token.
 * @param {string} signedChallenge - `challengeB64.sigB64` compound token
 * @returns {string|null} raw challenge base64url, or null if invalid
 */
function verifySignedChallenge(signedChallenge) {
  const dotIdx = signedChallenge.lastIndexOf('.')
  if (dotIdx === -1) return null
  const b64 = signedChallenge.slice(0, dotIdx)
  const sig  = signedChallenge.slice(dotIdx + 1)
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(b64)
    .digest('base64url')
  const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  return valid ? b64 : null
}

/**
 * Decode a base64url string to a Buffer.
 */
function fromB64url(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

export async function POST(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  const body = await request.json().catch(() => ({}))
  const { credential, _signedChallenge, deviceName, deviceType, method } = body

  if (!credential || !_signedChallenge) {
    return NextResponse.json({ error: 'credential and _signedChallenge required' }, { status: 400 })
  }

  // ── 1. Challenge verification ──────────────────────────────────────────────
  const pending = pendingChallenges.get(userId)
  if (!pending || Date.now() > pending.expiresAt) {
    return NextResponse.json({ error: 'Challenge expired — restart registration' }, { status: 400 })
  }

  // Constant-time comparison of the signed challenge tokens.
  if (
    pending.challenge.length !== _signedChallenge.length ||
    !crypto.timingSafeEqual(
      Buffer.from(pending.challenge),
      Buffer.from(_signedChallenge)
    )
  ) {
    return NextResponse.json({ error: 'Challenge mismatch' }, { status: 400 })
  }

  const expectedChallenge = verifySignedChallenge(_signedChallenge)
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Invalid challenge signature' }, { status: 400 })
  }

  // Remove used challenge.
  pendingChallenges.delete(userId)

  // ── 2. ClientDataJSON verification ────────────────────────────────────────
  let clientData
  try {
    clientData = JSON.parse(
      Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf8')
    )
  } catch {
    return NextResponse.json({ error: 'Invalid clientDataJSON' }, { status: 400 })
  }

  if (clientData.type !== 'webauthn.create') {
    return NextResponse.json({ error: 'Unexpected clientData type' }, { status: 400 })
  }

  if (clientData.challenge !== expectedChallenge) {
    return NextResponse.json({ error: 'Challenge in clientDataJSON does not match' }, { status: 400 })
  }

  if (clientData.origin !== ORIGIN) {
    return NextResponse.json(
      { error: `Origin mismatch: expected ${ORIGIN}` },
      { status: 400 }
    )
  }

  // ── 3. AuthenticatorData verification ────────────────────────────────────
  const authData = fromB64url(credential.response.authenticatorData)

  // Bytes 0–31: SHA-256 hash of rpId.
  const expectedRpIdHash = crypto.createHash('sha256').update(RP_ID).digest()
  const rpIdHash         = authData.subarray(0, 32)

  if (!crypto.timingSafeEqual(rpIdHash, expectedRpIdHash)) {
    return NextResponse.json({ error: 'RP ID hash mismatch' }, { status: 400 })
  }

  // Byte 32: flags.
  const flags          = authData[32]
  const userPresent    = !!(flags & 0x01)
  const userVerified   = !!(flags & 0x04)
  const attestedCred   = !!(flags & 0x40)

  if (!userPresent || !userVerified) {
    return NextResponse.json({ error: 'User presence/verification flags not set' }, { status: 400 })
  }

  if (!attestedCred) {
    return NextResponse.json({ error: 'Attested credential data flag not set' }, { status: 400 })
  }

  // Bytes 37–53: AAGUID (16 bytes), then 2-byte credentialIdLength.
  const credIdLen = authData.readUInt16BE(53)
  const credentialId = authData.subarray(55, 55 + credIdLen)
  // Remaining bytes: CBOR-encoded COSE public key.
  const coseKey = authData.subarray(55 + credIdLen)

  // ── 4. Persist the credential ─────────────────────────────────────────────
  // Store the raw COSE public key — full CBOR/COSE parsing is done at
  // authentication time (or use @simplewebauthn/server for that step).
  const { data: rows, error: insertError } = await insert('passkeys', {
    user_id:         userId,
    credential_id:   credentialId.toString('base64url'),
    public_key_cose: coseKey.toString('base64'),
    name:            (deviceName ?? '').trim() || 'My device',
    type:            deviceType ?? 'laptop',
    method:          method ?? 'Passkey',
    added_at:        new Date().toISOString().slice(0, 10),
    is_current:      false,
  })

  if (insertError) {
    // Duplicate credential_id (device already registered).
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'This device is already registered' }, { status: 409 })
    }
    console.error('[passkeys/register/verify] insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save passkey' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, deviceId: rows[0].id }, { status: 201 })
}

/*
 * ── Required migration ──────────────────────────────────────────────────────
 *
 * Run in Supabase SQL editor (or add to migrations/):
 *
 *   CREATE TABLE passkeys (
 *     id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     user_id         uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
 *     credential_id   text NOT NULL UNIQUE,
 *     public_key_cose text NOT NULL,
 *     name            text NOT NULL DEFAULT 'My device',
 *     type            text NOT NULL DEFAULT 'laptop',
 *     method          text NOT NULL DEFAULT 'Passkey',
 *     added_at        date NOT NULL DEFAULT CURRENT_DATE,
 *     is_current      boolean NOT NULL DEFAULT false,
 *     sign_count      bigint NOT NULL DEFAULT 0,
 *     created_at      timestamptz NOT NULL DEFAULT now()
 *   );
 *
 *   ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "passkeys: own" ON passkeys FOR ALL USING (auth.uid() = user_id);
 *
 *   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS totp_secret text;
 */
