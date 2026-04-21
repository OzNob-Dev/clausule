import {
  accountActive,
  findProfileByEmail,
  getUserSsoProvider,
  hasActiveSubscription,
  ssoProviderForAuthUser,
} from './accountRepository.js'

const NOT_FOUND_RESULT = {
  exists: false,
  isActive: false,
  isDeleted: false,
  hasMfa: false,
  hasSso: false,
  ssoProvider: null,
  hasPaid: false,
}

export function ssoProvider(user) {
  return ssoProviderForAuthUser(user)
}

export async function checkEmailAccount(email) {
  const { profile, error: profileError } = await findProfileByEmail(email, 'id,totp_secret,authenticator_app_configured,is_active,is_deleted')
  if (profileError) return { error: profileError, log: 'profile lookup failed' }

  if (!profile) return { result: NOT_FOUND_RESULT }

  const { hasPaid, error: paidError } = await hasActiveSubscription(profile.id)
  if (paidError) return { error: paidError, log: 'subscription lookup failed' }

  const { provider, error: authError } = await getUserSsoProvider(profile.id)
  if (authError) return { error: authError, log: 'auth user lookup failed' }

  return {
    result: {
      exists: true,
      isActive: accountActive(profile, hasPaid),
      isDeleted: Boolean(profile.is_deleted),
      hasMfa: Boolean(profile.totp_secret || profile.authenticator_app_configured),
      hasSso: Boolean(provider),
      ssoProvider: provider,
      hasPaid,
    },
  }
}
