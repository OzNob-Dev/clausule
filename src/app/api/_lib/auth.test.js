import { afterEach, describe, expect, it } from 'vitest'
import { requireAuth } from './auth.js'

describe('requireAuth test bypass', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS
  })

  it('returns a fake employee session when the auth test bypass is enabled', async () => {
    process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS = 'employee'

    expect(requireAuth(new Request('http://localhost/api/auth/me'))).toEqual({
      userId: 'auth-test-employee',
      email: 'employee.test@clausule.app',
      role: 'employee',
      authMethod: 'otp',
      error: null,
    })
  })
})
