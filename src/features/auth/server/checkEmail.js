import { accountActive, findProfileByEmail, getUserSsoProvider, hasActiveSubscription } from './accountRepository.js'

const NOT_FOUND_RESULT = { nextStep: 'signup' }

export async function checkEmailAccount(email) {
  const { profile, error: profileError } = await findProfileByEmail(email, 'id,totp_secret,is_active,is_deleted')
  if (profileError) return { error: profileError, log: 'profile lookup failed' }

  if (!profile) return { result: NOT_FOUND_RESULT }

  const { hasPaid, error: paidError } = await hasActiveSubscription(profile.id)
  if (paidError) return { error: paidError, log: 'subscription lookup failed' }

  const { provider, error: authError } = await getUserSsoProvider(profile.id)
  if (authError) return { error: authError, log: 'auth user lookup failed' }

  return {
    result: {
      nextStep: !accountActive(profile, hasPaid) || profile.is_deleted
        ? 'signup'
        : provider
          ? 'sso'
          : profile.totp_secret
            ? 'mfa'
            : 'otp',
    },
  }
}
