/**
 * POST /api/auth/passkeys/register/options
 *
 * Returns WebAuthn PublicKeyCredentialCreationOptions for the browser's
 * navigator.credentials.create() call.
 *
 * The challenge is signed with HMAC-SHA256 using WEBAUTHN_CHALLENGE_SECRET
 * and returned as a base64url string.  The browser sends the credential back
 * to /api/auth/passkeys/register/verify.
 *
 * Required env var: WEBAUTHN_CHALLENGE_SECRET (min 32 random bytes, hex-encoded)
 *
 * Body: {} (user identity comes from the session cookie)
 * Response 200: { options: PublicKeyCredentialCreationOptionsJSON }
 */

import { NextResponse }               from 'next/server'
import crypto                         from 'node:crypto'
import { requireAuth, unauthorized }  from '../../../../../_lib/auth.js'
import { select }                     from '../../../../../_lib/supabase.js'

const RP_ID   = process.env.NEXT_PUBLIC_RP_ID   ?? 'localhost'
const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME ?? 'Clausule'

// Issued challenges are cached in memory for 5 minutes.
// Production: move to Redis or a DB table to survive restarts.
/** @type {Map<string, { challenge: string, expiresAt: number }>} */
const pendingChallenges = new Map()

const CHALLENGE_TTL_MS = 5 * 60 * 1000

/**
 * Sign a challenge so /verify can confirm it was issued by this server.
 * Returns a compound base64url token: `${challengeB64}.${hmacB64}`
 */
function signChallenge(challengeBytes) {
  const secret = process.env.WEBAUTHN_CHALLENGE_SECRET ?? ''
  const b64    = challengeBytes.toString('base64url')
  const sig    = crypto
    .createHmac('sha256', secret)
    .update(b64)
    .digest('base64url')
  return `${b64}.${sig}`
}

export async function POST(request) {
  const { userId, error: authError } = await requireAuth(request)
  if (authError) return unauthorized()

  // Fetch user info for the credential descriptor.
  const { data: profiles } = await select(
    'profiles',
    `id=eq.${userId}&select=email,first_name,last_name&limit=1`
  )
  const profile = profiles?.[0]

  if (!profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Generate a fresh 32-byte challenge.
  const challengeBytes = crypto.randomBytes(32)
  const signedChallenge = signChallenge(challengeBytes)

  // Cache for verification step.
  pendingChallenges.set(userId, {
    challenge: signedChallenge,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  })

  // Prune expired entries.
  for (const [key, entry] of pendingChallenges) {
    if (Date.now() > entry.expiresAt) pendingChallenges.delete(key)
  }

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    || profile.email

  /** @type {PublicKeyCredentialCreationOptionsJSON} */
  const options = {
    rp: {
      id:   RP_ID,
      name: RP_NAME,
    },
    user: {
      id:          Buffer.from(userId).toString('base64url'),
      name:        profile.email,
      displayName,
    },
    challenge: challengeBytes.toString('base64url'),
    pubKeyCredParams: [
      { type: 'public-key', alg: -7  },   // ES256 (preferred)
      { type: 'public-key', alg: -257 },  // RS256 (fallback)
    ],
    timeout: 60_000,
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification:        'required',
      residentKey:             'required',
    },
    // Exclude credentials already registered on this account to prevent duplicates.
    // In production: load from a `passkeys` table and list each credentialId.
    excludeCredentials: [],
  }

  return NextResponse.json({ options, _signedChallenge: signedChallenge })
}

/** Export so the verify route can check the challenge without a DB round-trip. */
export { pendingChallenges }
