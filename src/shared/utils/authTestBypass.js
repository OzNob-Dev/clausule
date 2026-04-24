export const AUTH_TEST_BYPASS_VALUE = 'employee'

export const authTestBypassUser = {
  id: 'auth-test-employee',
  email: 'employee.test@clausule.app',
  role: 'employee',
  authMethod: 'otp',
}

export const authTestBypassBootstrap = {
  user: {
    id: authTestBypassUser.id,
    email: authTestBypassUser.email,
    role: authTestBypassUser.role,
  },
  profile: {
    firstName: 'Test',
    lastName: 'Employee',
    email: authTestBypassUser.email,
    mobile: '',
    jobTitle: 'QA',
    department: 'Testing',
  },
  security: {
    authenticatorAppConfigured: true,
    authenticatedWithOtp: true,
    ssoConfigured: false,
  },
}

export function isAuthTestBypassEnabled() {
  return process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_AUTH_TEST_BYPASS === AUTH_TEST_BYPASS_VALUE
}
