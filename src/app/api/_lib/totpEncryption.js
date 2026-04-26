/**
 * AES-256-GCM encryption for TOTP secrets stored in the database.
 *
 * Stored format: `enc:v1:<base64url(iv)>:<base64url(authTag)>:<base64url(ciphertext)>`
 * Plaintext values (pre-migration) are auto-detected and transparently decrypted as-is.
 *
 * Required env var:
 *   TOTP_ENCRYPTION_KEY — 32-byte base64 or hex key.
 *   Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

import crypto from 'node:crypto'

const PREFIX = 'enc:v1:'
const IV_BYTES = 12
const TAG_BYTES = 16
const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const raw = process.env.TOTP_ENCRYPTION_KEY
  if (!raw) throw new Error('TOTP_ENCRYPTION_KEY environment variable is not set')
  const key = Buffer.from(raw, raw.length === 64 ? 'hex' : 'base64')
  if (key.length !== 32) throw new Error('TOTP_ENCRYPTION_KEY must be 32 bytes')
  return key
}

/**
 * Encrypt a TOTP secret for storage.
 * @param {string} plaintext  Base32 TOTP secret
 * @returns {string}  Encrypted string with `enc:v1:` prefix
 */
export function encryptTotpSecret(plaintext) {
  const key = getKey()
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`
}

/**
 * Decrypt a TOTP secret from storage.
 * Transparently returns plaintext values for backwards-compat migration path.
 *
 * @param {string} stored  Value from DB (encrypted or legacy plaintext)
 * @returns {{ secret: string, wasPlaintext: boolean }}
 */
export function decryptTotpSecret(stored) {
  if (!stored.startsWith(PREFIX)) {
    // Legacy plaintext — return as-is so first-login re-encryption can fire.
    return { secret: stored, wasPlaintext: true }
  }

  const key = getKey()
  const parts = stored.slice(PREFIX.length).split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted TOTP secret format')

  const iv = Buffer.from(parts[0], 'base64url')
  const authTag = Buffer.from(parts[1], 'base64url')
  const ciphertext = Buffer.from(parts[2], 'base64url')

  if (iv.length !== IV_BYTES) throw new Error('Invalid TOTP IV length')
  if (authTag.length !== TAG_BYTES) throw new Error('Invalid TOTP auth tag length')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return { secret: decrypted.toString('utf8'), wasPlaintext: false }
}
