import { findProfileById, getUserSsoProvider } from './accountRepository.js'

export async function bootstrapSession({ userId, email, role, authMethod }) {
  const { profile, error } = await findProfileById(userId, 'first_name,last_name,email,mobile,job_title,department,totp_secret')
  if (error) return { error, log: '[auth/bootstrap GET]', body: { error: 'Failed to fetch bootstrap data' }, status: 500 }

  const { provider, error: authUserError } = await getUserSsoProvider(userId)
  if (authUserError) {
    return {
      error: authUserError,
      log: '[auth/bootstrap auth user GET]',
      body: { error: 'Failed to fetch auth state' },
      status: 500,
    }
  }

  return {
    body: {
      user: { id: userId, email, role },
      profile: {
        firstName: profile?.first_name ?? '',
        lastName: profile?.last_name ?? '',
        email: profile?.email ?? email ?? '',
        mobile: profile?.mobile ?? '',
        jobTitle: profile?.job_title ?? '',
        department: profile?.department ?? '',
      },
      security: {
        authenticatorAppConfigured: Boolean(profile?.totp_secret),
        authenticatedWithOtp: authMethod === 'otp',
        ssoConfigured: Boolean(provider),
      },
    },
    status: 200,
  }
}
