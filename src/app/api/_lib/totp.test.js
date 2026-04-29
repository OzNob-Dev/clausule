import { describe, expect, it } from 'vitest'
import { base32Decode, generateBase32Secret, totpCode, verifyTotp } from './totp'

describe('totp helpers', () => {
  it('encodes and verifies codes', () => {
    const secret = generateBase32Secret(10)
    expect(base32Decode(secret)).toBeInstanceOf(Buffer)
    expect(totpCode(secret, 1)).toHaveLength(6)
    expect(verifyTotp(secret, totpCode(secret, Math.floor(Date.now() / 1000 / 30)))).toBe(true)
  })
})
