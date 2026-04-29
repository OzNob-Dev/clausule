import { beforeEach, describe, expect, it } from 'vitest'
import { decryptTotpSecret, encryptTotpSecret } from './totpEncryption'

describe('totp encryption helpers', () => {
  beforeEach(() => {
    process.env.TOTP_ENCRYPTION_KEY = Buffer.from('0123456789abcdef0123456789abcdef').toString('base64')
  })

  it('round-trips secrets and preserves plaintext fallback', () => {
    const encrypted = encryptTotpSecret('ABCDEF')
    expect(decryptTotpSecret(encrypted)).toEqual({ secret: 'ABCDEF', wasPlaintext: false })
    expect(decryptTotpSecret('LEGACY')).toEqual({ secret: 'LEGACY', wasPlaintext: true })
  })
})
