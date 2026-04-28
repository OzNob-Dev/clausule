import { afterEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
  vi.resetModules()
})

describe('signupVerification', () => {
  it('fails closed when no signing secret is configured', async () => {
    delete process.env.JWT_SECRET
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    const { signSignupVerificationToken } = await import('./signupVerification.js')

    expect(() => signSignupVerificationToken('ada@example.com')).toThrow('JWT_SECRET environment variable is not set')
  })

  it('signs and verifies a token when a secret is configured', async () => {
    process.env.JWT_SECRET = 'test-secret'

    const { signSignupVerificationToken, verifySignupVerificationToken } = await import('./signupVerification.js')
    const token = signSignupVerificationToken('Ada@Example.com')

    expect(verifySignupVerificationToken(token, 'ada@example.com')).toEqual({ ok: true })
  })
})
