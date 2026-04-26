import { insert, select } from '@api/_lib/supabase.js'
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

const MAX_CBOR_BYTES = 8192
const MAX_CBOR_DEPTH = 16

function readLength(buffer, offset, additional) {
  if (additional < 24) return { value: additional, offset }
  if (additional === 24) {
    if (offset + 1 > buffer.length) throw new Error('Truncated CBOR length (1 byte)')
    return { value: buffer.readUInt8(offset), offset: offset + 1 }
  }
  if (additional === 25) {
    if (offset + 2 > buffer.length) throw new Error('Truncated CBOR length (2 bytes)')
    return { value: buffer.readUInt16BE(offset), offset: offset + 2 }
  }
  if (additional === 26) {
    if (offset + 4 > buffer.length) throw new Error('Truncated CBOR length (4 bytes)')
    return { value: buffer.readUInt32BE(offset), offset: offset + 4 }
  }
  if (additional === 27) {
    if (offset + 8 > buffer.length) throw new Error('Truncated CBOR length (8 bytes)')
    const value = Number(buffer.readBigUInt64BE(offset))
    if (value > MAX_CBOR_BYTES) throw new Error('CBOR length exceeds maximum')
    return { value, offset: offset + 8 }
  }
  throw new Error('Unsupported CBOR length encoding')
}

function decodeCborValue(buffer, offset = 0, depth = 0) {
  if (depth > MAX_CBOR_DEPTH) throw new Error('CBOR nesting depth exceeded')
  if (offset >= buffer.length) throw new Error('Unexpected end of CBOR')

  const initial = buffer[offset++]
  const major = initial >> 5
  const additional = initial & 0x1f
  if (additional === 31) throw new Error('Indefinite-length CBOR is not supported')

  const lengthInfo = readLength(buffer, offset, additional)
  let cursor = lengthInfo.offset
  const length = lengthInfo.value

  if (major === 0) return { value: length, offset: cursor }
  if (major === 1) return { value: -1 - length, offset: cursor }
  if (major === 2) {
    if (cursor + length > buffer.length) throw new Error('CBOR byte string out of bounds')
    return { value: buffer.subarray(cursor, cursor + length), offset: cursor + length }
  }
  if (major === 3) {
    if (cursor + length > buffer.length) throw new Error('CBOR text string out of bounds')
    return { value: buffer.subarray(cursor, cursor + length).toString('utf8'), offset: cursor + length }
  }
  if (major === 4) {
    const items = []
    for (let i = 0; i < length; i += 1) {
      const decoded = decodeCborValue(buffer, cursor, depth + 1)
      items.push(decoded.value)
      cursor = decoded.offset
    }
    return { value: items, offset: cursor }
  }
  if (major === 5) {
    const items = new Map()
    for (let i = 0; i < length; i += 1) {
      const key = decodeCborValue(buffer, cursor, depth + 1)
      const val = decodeCborValue(buffer, key.offset, depth + 1)
      items.set(key.value, val.value)
      cursor = val.offset
    }
    return { value: items, offset: cursor }
  }

  throw new Error('Unsupported CBOR major type')
}

function parseAttestationObject(encoded) {
  const raw = fromB64url(encoded ?? '')
  if (!raw.length || raw.length > MAX_CBOR_BYTES) throw new Error('Invalid attestationObject')

  const decoded = decodeCborValue(raw)
  if (!(decoded.value instanceof Map)) throw new Error('Invalid attestationObject')

  const fmt = decoded.value.get('fmt')
  const attStmt = decoded.value.get('attStmt')
  const authData = decoded.value.get('authData')
  if (fmt !== 'none') throw new Error('Unsupported attestation format')
  if (!(attStmt instanceof Map)) throw new Error('Invalid attestation statement')
  if (!Buffer.isBuffer(authData)) throw new Error('Invalid authenticator data')

  return authData
}

export async function createPasskeyRegistrationOptions({ request, userId }) {
  let rpId
  try {
    rpId = getRpId(request)
  } catch (error) {
    return {
      log: ['[passkeys/register/options] WebAuthn config error:', error?.message ?? error],
      ...jsonError('Passkey configuration is incomplete', 500),
    }
  }
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

  const { data: existingPasskeys } = await select(
    'passkeys',
    new URLSearchParams({ user_id: `eq.${userId}`, select: 'credential_id' }).toString()
  )
  const excludeCredentials = (existingPasskeys ?? []).map((p) => ({
    id: p.credential_id,
    type: 'public-key',
  }))

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
        excludeCredentials,
      },
      _signedChallenge: signedChallenge,
    },
    status: 200,
  }
}

export async function verifyPasskeyRegistration({ request, userId, body }) {
  let rpId
  let expectedOrigin
  try {
    rpId = getRpId(request)
    expectedOrigin = getExpectedOrigin(request)
  } catch (error) {
    return {
      log: ['[passkeys/register/verify] WebAuthn config error:', error?.message ?? error],
      ...jsonError('Passkey configuration is incomplete', 500),
    }
  }
  const { credential, _signedChallenge, deviceName, deviceType, method } = body

  if (!credential || !_signedChallenge) return jsonError('credential and _signedChallenge required')
  if (credential.type && credential.type !== 'public-key') return jsonError('Unexpected credential type')

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

  const rawClientDataJson = fromB64url(credential.response?.clientDataJSON ?? '')
  if (!rawClientDataJson.length || rawClientDataJson.length > 4096) return jsonError('Invalid clientDataJSON')

  let clientData
  try {
    clientData = JSON.parse(rawClientDataJson.toString('utf8'))
  } catch {
    return jsonError('Invalid clientDataJSON')
  }

  if (clientData.type !== 'webauthn.create') return jsonError('Unexpected clientData type')
  if (clientData.challenge !== expectedChallenge) return jsonError('Challenge in clientDataJSON does not match')
  if (clientData.origin !== expectedOrigin) return jsonError('Origin mismatch')

  let authData
  try {
    authData = parseAttestationObject(credential.response?.attestationObject)
  } catch (error) {
    return jsonError(error.message === 'Unsupported attestation format' ? error.message : 'Invalid attestationObject')
  }
  if (authData.length < 55 || authData.length > 4096) return jsonError('AuthenticatorData too short')

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
  if (55 + credIdLen > authData.length) return jsonError('Invalid credential data')
  const credentialId = authData.subarray(55, 55 + credIdLen)
  const coseKey = authData.subarray(55 + credIdLen)
  if (!credentialId.length || !coseKey.length) return jsonError('Invalid credential data')

  const statedCredentialId = String(credential.rawId ?? credential.id ?? '').trim()
  const persistedCredentialId = credentialId.toString('base64url')
  if (statedCredentialId && statedCredentialId !== persistedCredentialId) return jsonError('Credential ID mismatch')

  const { data: rows, error: insertError } = await insert('passkeys', {
    user_id: userId,
    credential_id: persistedCredentialId,
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
