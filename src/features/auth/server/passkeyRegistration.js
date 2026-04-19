import crypto from 'node:crypto'
import { insert, select } from '@api/_lib/supabase.js'

const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME ?? 'Clausule'
const CHALLENGE_TTL_MS = 5 * 60 * 1000

export const pendingChallenges = new Map()

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

function signChallenge(challengeBytes) {
  const secret = process.env.WEBAUTHN_CHALLENGE_SECRET ?? ''
  const b64 = challengeBytes.toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url')
  return `${b64}.${sig}`
}

function verifySignedChallenge(signedChallenge) {
  const dotIdx = signedChallenge.lastIndexOf('.')
  if (dotIdx === -1) return null
  const b64 = signedChallenge.slice(0, dotIdx)
  const sig = signedChallenge.slice(dotIdx + 1)
  const expected = crypto
    .createHmac('sha256', process.env.WEBAUTHN_CHALLENGE_SECRET ?? '')
    .update(b64)
    .digest('base64url')
  const valid = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  return valid ? b64 : null
}

function fromB64url(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function jsonError(error, status = 400) {
  return { body: { error }, status }
}

function pruneExpiredChallenges() {
  for (const [key, entry] of pendingChallenges) {
    if (Date.now() > entry.expiresAt) pendingChallenges.delete(key)
  }
}

export async function createPasskeyRegistrationOptions({ request, userId }) {
  const rpId = getRpId(request)
  const { data: profiles } = await select('profiles', `id=eq.${userId}&select=email,first_name,last_name&limit=1`)
  const profile = profiles?.[0]

  if (!profile) return jsonError('User profile not found', 404)

  const challengeBytes = crypto.randomBytes(32)
  const signedChallenge = signChallenge(challengeBytes)

  pendingChallenges.set(userId, {
    challenge: signedChallenge,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  })
  pruneExpiredChallenges()

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email

  return {
    body: {
      options: {
        rp: { id: rpId, name: RP_NAME },
        user: {
          id: Buffer.from(userId).toString('base64url'),
          name: profile.email,
          displayName,
        },
        challenge: challengeBytes.toString('base64url'),
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        timeout: 60_000,
        attestation: 'none',
        authenticatorSelection: {
          userVerification: 'required',
          residentKey: 'required',
        },
        excludeCredentials: [],
      },
      _signedChallenge: signedChallenge,
    },
    status: 200,
  }
}

export async function verifyPasskeyRegistration({ request, userId, body }) {
  const rpId = getRpId(request)
  const expectedOrigin = getExpectedOrigin(request)
  const { credential, _signedChallenge, deviceName, deviceType, method } = body

  if (!credential || !_signedChallenge) return jsonError('credential and _signedChallenge required')

  const pending = pendingChallenges.get(userId)
  if (!pending || Date.now() > pending.expiresAt) return jsonError('Challenge expired — restart registration')

  if (
    pending.challenge.length !== _signedChallenge.length ||
    !crypto.timingSafeEqual(Buffer.from(pending.challenge), Buffer.from(_signedChallenge))
  ) {
    return jsonError('Challenge mismatch')
  }

  const expectedChallenge = verifySignedChallenge(_signedChallenge)
  if (!expectedChallenge) return jsonError('Invalid challenge signature')

  pendingChallenges.delete(userId)

  let clientData
  try {
    clientData = JSON.parse(Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf8'))
  } catch {
    return jsonError('Invalid clientDataJSON')
  }

  if (clientData.type !== 'webauthn.create') return jsonError('Unexpected clientData type')
  if (clientData.challenge !== expectedChallenge) return jsonError('Challenge in clientDataJSON does not match')
  if (clientData.origin !== expectedOrigin) return jsonError(`Origin mismatch: got ${clientData.origin}, expected ${expectedOrigin}`)

  const authData = fromB64url(credential.response.authenticatorData)
  if (authData.length < 55) return jsonError('AuthenticatorData too short')

  const expectedRpIdHash = crypto.createHash('sha256').update(rpId).digest()
  const rpIdHash = authData.subarray(0, 32)
  if (rpIdHash.length !== expectedRpIdHash.length || !crypto.timingSafeEqual(rpIdHash, expectedRpIdHash)) {
    return jsonError('RP ID hash mismatch')
  }

  const flags = authData[32]
  const userPresent = !!(flags & 0x01)
  const userVerified = !!(flags & 0x04)
  const attestedCred = !!(flags & 0x40)

  if (!userPresent || !userVerified) return jsonError('User presence/verification flags not set')
  if (!attestedCred) return jsonError('Attested credential data flag not set')

  const credIdLen = authData.readUInt16BE(53)
  const credentialId = authData.subarray(55, 55 + credIdLen)
  const coseKey = authData.subarray(55 + credIdLen)

  const { data: rows, error: insertError } = await insert('passkeys', {
    user_id: userId,
    credential_id: credentialId.toString('base64url'),
    public_key_cose: coseKey.toString('base64'),
    name: (deviceName ?? '').trim() || 'My device',
    type: deviceType ?? 'laptop',
    method: method ?? 'Passkey',
    added_at: new Date().toISOString().slice(0, 10),
    is_current: false,
  })

  if (insertError?.code === '23505') return jsonError('This device is already registered', 409)
  if (insertError) {
    return {
      log: ['[passkeys/register/verify] insert error:', insertError],
      ...jsonError(`Failed to save passkey: ${insertError.message ?? JSON.stringify(insertError)}`, 500),
    }
  }

  return { body: { ok: true, deviceId: rows?.[0]?.id ?? null }, status: 201 }
}
