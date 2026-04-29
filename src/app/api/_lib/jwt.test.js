import { beforeEach, describe, expect, it } from 'vitest'
import { generateRefreshToken, hashRefreshToken, signAccessToken, verifyAccessToken } from './jwt'

describe('jwt helpers', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = '0123456789abcdef0123456789abcdef'
  })

  it('signs and verifies access tokens', () => {
    const token = signAccessToken({ userId: 'user-1', email: 'ada@example.com', role: 'employee', authMethod: 'otp' })
    const claims = verifyAccessToken(token)

    expect(claims.sub).toBe('user-1')
    expect(claims.amr).toBe('otp')
  })

  it('generates and hashes refresh tokens', () => {
    const { token, hash } = generateRefreshToken()
    expect(hashRefreshToken(token)).toBe(hash)
  })
})
