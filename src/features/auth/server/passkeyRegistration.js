import { insert } from '@api/_lib/supabase.js'
import { findProfileById } from './accountRepository.js'
import { consumePasskeyChallenge, storePasskeyChallenge } from './passkeyChallenge.js'
import {
  fromB64url,
  getChallengeTtlMs,
  getExpectedOrigin,
  getRpId,
  getRpName,
  jsonError,
  signChallenge,
  verifySignedChallenge,
} from './passkeyShared.js'
import crypto from 'node:crypto'

export async function createPasskeyRegistrationOptions({ request, userId }) {
  const rpId = getRpId(request)
  const { profile } = await findProfileById(userId, 'email,first_name,last_name')

  if (!profile) return jsonError('User profile not found', 404)

  const challengeBytes = crypto.randomBytes(32)
  const signedChallenge = signChallenge(challengeBytes)
  const expiresAt = new Date(Date.now() + getChallengeTtlMs()).toISOString()

  const { error: challengeError } = await storePasskeyChallenge({
    userId,
    challenge: signedChallenge,
    expiresAt,
  })
  if (challengeError) {
    return {
      log: ['[passkeys/register/options] challenge store error:', challengeError],
      ...jsonError('Failed to create passkey challenge', 500),
    }
  }

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email

  return {
    body: {
      options: {
        rp: { id: rpId, name: getRpName() },
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

  const expectedChallenge = verifySignedChallenge(_signedChallenge)
  if (!expectedChallenge) return jsonError('Invalid challenge signature')
  const { row: pending, error: challengeError } = await consumePasskeyChallenge({
    userId,
    challenge: _signedChallenge,
  })
  if (challengeError) {
    return {
      log: ['[passkeys/register/verify] challenge consume error:', challengeError],
      ...jsonError('Failed to verify passkey', 500),
    }
  }
  if (!pending) return jsonError('Challenge expired — restart registration')

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
      ...jsonError('Failed to save passkey', 500),
    }
  }

  return { body: { ok: true, deviceId: rows?.[0]?.id ?? null }, status: 201 }
}
