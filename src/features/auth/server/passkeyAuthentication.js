import crypto from 'node:crypto'
import { select, update } from '@api/_lib/supabase.js'
import { accountActive, findProfileById, hasActiveSubscription } from './accountRepository.js'
import { consumePasskeyAuthChallenge, storePasskeyAuthChallenge } from './passkeyChallenge.js'
import {
  fromB64url,
  getChallengeTtlMs,
  getExpectedOrigin,
  getRpId,
  jsonError,
  signChallenge,
  verifySignedChallenge,
} from './passkeyShared.js'

// Hard cap on CBOR input size to bound parsing cost on malformed input.
const MAX_CBOR_BYTES = 8192
// Hard cap on CBOR collection depth to prevent recursion bombs.
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

function toBase64url(buffer) {
  return Buffer.from(buffer).toString('base64url')
}

function curveName(curve) {
  if (curve === 1) return 'P-256'
  if (curve === 2) return 'P-384'
  if (curve === 3) return 'P-521'
  throw new Error('Unsupported EC curve')
}

function publicKeyFromCose(publicKeyCose) {
  const raw = Buffer.from(publicKeyCose, 'base64')
  if (raw.length === 0 || raw.length > MAX_CBOR_BYTES) throw new Error('COSE key size out of range')
  const decoded = decodeCborValue(raw)
  if (!(decoded.value instanceof Map)) throw new Error('Invalid COSE key')

  const keyType = decoded.value.get(1)
  const alg = decoded.value.get(3)

  if (keyType === 2) {
    const crv = decoded.value.get(-1)
    const x = decoded.value.get(-2)
    const y = decoded.value.get(-3)
    if (!Buffer.isBuffer(x) || !Buffer.isBuffer(y)) throw new Error('Invalid EC key')

    return {
      alg,
      key: crypto.createPublicKey({
        key: {
          kty: 'EC',
          crv: curveName(crv),
          x: toBase64url(x),
          y: toBase64url(y),
        },
        format: 'jwk',
      }),
    }
  }

  if (keyType === 3) {
    const n = decoded.value.get(-1)
    const e = decoded.value.get(-2)
    if (!Buffer.isBuffer(n) || !Buffer.isBuffer(e)) throw new Error('Invalid RSA key')

    return {
      alg,
      key: crypto.createPublicKey({
        key: {
          kty: 'RSA',
          n: toBase64url(n),
          e: toBase64url(e),
        },
        format: 'jwk',
      }),
    }
  }

  throw new Error('Unsupported COSE key type')
}

function verifyAssertionSignature({ publicKeyCose, authenticatorData, clientDataJson, signature }) {
  const { key, alg } = publicKeyFromCose(publicKeyCose)
  const signedData = Buffer.concat([
    authenticatorData,
    crypto.createHash('sha256').update(clientDataJson).digest(),
  ])

  if (alg === -7) return crypto.verify('sha256', signedData, key, signature)
  if (alg === -257) return crypto.verify('RSA-SHA256', signedData, key, signature)
  throw new Error('Unsupported WebAuthn algorithm')
}

function firstRow(data) {
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}

function credentialIdFromAssertion(credential) {
  return String(credential?.rawId ?? credential?.id ?? '').trim()
}

async function resolvePasskeyAccount(credentialId) {
  const query = new URLSearchParams({
    credential_id: `eq.${credentialId}`,
    select: 'id,user_id,public_key_cose,sign_count',
    limit: '1',
  }).toString()
  const { data, error } = await select('passkeys', query)
  if (error) return { error, log: ['[passkeys/auth/verify] passkey lookup failed:', error] }

  const passkey = firstRow(data)
  if (!passkey) return { body: { error: 'Invalid passkey' }, status: 401 }

  const { profile, error: profileError } = await findProfileById(passkey.user_id, 'id,email,role,is_active,is_deleted')
  if (profileError) return { error: profileError, log: ['[passkeys/auth/verify] profile lookup failed:', profileError] }
  if (!profile) return { body: { error: 'Invalid passkey' }, status: 401 }

  const { hasPaid, error: paidError } = await hasActiveSubscription(profile.id)
  if (paidError) return { error: paidError, log: ['[passkeys/auth/verify] subscription lookup failed:', paidError] }
  if (!accountActive(profile, hasPaid) || profile.is_deleted) return { body: { error: 'Invalid passkey' }, status: 401 }

  return { passkey, profile }
}

async function markCurrentPasskey({ passkeyId, userId, previousCount, nextCount }) {
  const { error: resetError } = await update('passkeys', `user_id=eq.${userId}&id=neq.${passkeyId}`, { is_current: false })
  if (resetError) return { error: resetError }

  const query = nextCount > previousCount
    ? `id=eq.${passkeyId}&user_id=eq.${userId}&sign_count=eq.${previousCount}`
    : `id=eq.${passkeyId}&user_id=eq.${userId}`
  const body = nextCount > previousCount ? { sign_count: nextCount, is_current: true } : { is_current: true }
  const { error } = await update('passkeys', query, body, { expectRows: 'single' })
  return { error }
}

export async function createPasskeyAuthenticationOptions({ request }) {
  const challengeBytes = crypto.randomBytes(32)
  const signedChallenge = signChallenge(challengeBytes)
  const expiresAt = new Date(Date.now() + getChallengeTtlMs()).toISOString()
  const { error } = await storePasskeyAuthChallenge({ challenge: signedChallenge, expiresAt })

  if (error) {
    return {
      log: ['[passkeys/auth/options] challenge store error:', error],
      ...jsonError('Failed to create passkey challenge', 500),
    }
  }

  return {
    body: {
      options: {
        challenge: challengeBytes.toString('base64url'),
        rpId: getRpId(request),
        timeout: 60_000,
        userVerification: 'required',
        allowCredentials: [],
      },
      _signedChallenge: signedChallenge,
    },
    status: 200,
  }
}

export async function verifyPasskeyAuthentication({ request, body }) {
  const { credential, _signedChallenge } = body
  if (!credential || !_signedChallenge) return jsonError('credential and _signedChallenge required')

  const expectedChallenge = verifySignedChallenge(_signedChallenge)
  if (!expectedChallenge) return jsonError('Invalid challenge signature')

  const { row: pending, error: challengeError } = await consumePasskeyAuthChallenge({ challenge: _signedChallenge })
  if (challengeError) {
    return {
      log: ['[passkeys/auth/verify] challenge consume error:', challengeError],
      ...jsonError('Failed to verify passkey', 500),
    }
  }
  if (!pending) return jsonError('Challenge expired — restart passkey sign in')

  const credentialId = credentialIdFromAssertion(credential)
  if (!credentialId) return jsonError('Invalid passkey')

  const account = await resolvePasskeyAccount(credentialId)
  if (account.log) return { log: account.log, body: { error: 'Failed to verify passkey' }, status: 500 }
  if (!account.passkey || !account.profile) return { body: account.body, status: account.status }

  const rawClientDataJson = fromB64url(credential.response?.clientDataJSON ?? '')
  const authenticatorData = fromB64url(credential.response?.authenticatorData ?? '')
  const signature = fromB64url(credential.response?.signature ?? '')
  // authenticatorData: 32-byte rpIdHash + 1-byte flags + 4-byte signCount = 37 bytes minimum.
  // Cap lengths to reject oversized inputs before any parsing.
  if (!rawClientDataJson.length || rawClientDataJson.length > 4096) return jsonError('Invalid passkey')
  if (authenticatorData.length < 37 || authenticatorData.length > 4096) return jsonError('Invalid passkey')
  if (!signature.length || signature.length > 512) return jsonError('Invalid passkey')

  let clientData
  try {
    clientData = JSON.parse(rawClientDataJson.toString('utf8'))
  } catch {
    return jsonError('Invalid clientDataJSON')
  }

  if (clientData.type !== 'webauthn.get') return jsonError('Unexpected clientData type')
  if (clientData.challenge !== expectedChallenge) return jsonError('Challenge in clientDataJSON does not match')
  if (clientData.origin !== getExpectedOrigin(request)) return jsonError('Origin mismatch')

  const expectedRpIdHash = crypto.createHash('sha256').update(getRpId(request)).digest()
  const rpIdHash = authenticatorData.subarray(0, 32)
  if (rpIdHash.length !== expectedRpIdHash.length || !crypto.timingSafeEqual(rpIdHash, expectedRpIdHash)) {
    return jsonError('RP ID hash mismatch')
  }

  const flags = authenticatorData[32]
  const userPresent = !!(flags & 0x01)
  const userVerified = !!(flags & 0x04)
  if (!userPresent || !userVerified) return jsonError('User presence/verification flags not set')

  const signCount = authenticatorData.readUInt32BE(33)
  const storedCount = Number(account.passkey.sign_count ?? 0)
  if (storedCount > 0 && signCount <= storedCount) return jsonError('Invalid passkey', 401)

  try {
    const valid = verifyAssertionSignature({
      publicKeyCose: account.passkey.public_key_cose,
      authenticatorData,
      clientDataJson: rawClientDataJson,
      signature,
    })
    if (!valid) return jsonError('Invalid passkey', 401)
  } catch (error) {
    return {
      log: ['[passkeys/auth/verify] signature verification error:', error],
      ...jsonError('Failed to verify passkey', 500),
    }
  }

  const userHandle = credential.response?.userHandle ? fromB64url(credential.response.userHandle).toString('utf8') : null
  if (userHandle && userHandle !== account.profile.id) return jsonError('Invalid passkey', 401)

  const { error: updateError } = await markCurrentPasskey({
    passkeyId: account.passkey.id,
    userId: account.profile.id,
    previousCount: storedCount,
    nextCount: signCount,
  })
  if (updateError) {
    return {
      log: ['[passkeys/auth/verify] passkey update error:', updateError],
      ...jsonError('Failed to verify passkey', 500),
    }
  }

  return {
    body: { ok: true, role: account.profile.role },
    status: 200,
    session: {
      userId: account.profile.id,
      email: account.profile.email,
      role: account.profile.role,
      authMethod: 'passkey',
    },
  }
}
