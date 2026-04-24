import { homePathForRole } from '@shared/utils/routes'
import { accountActive, findProfileByEmail, hasActiveSubscription } from './accountRepository.js'
import { exchangeSsoCode } from './ssoProviders.js'
import { consumeSsoAuthState } from './ssoState.js'

export async function resolveSsoCallback({ origin, provider, code, state, appleUser }) {
  if (!code || !state) return { type: 'error', error: 'missing_params' }

  const { row: stored, error: stateError } = await consumeSsoAuthState({ state, provider })
  if (stateError) return { type: 'error', error: 'account_error', log: [`[sso/${provider}] state consume:`, stateError.message ?? stateError] }
  if (!stored) return { type: 'error', error: 'state_mismatch' }

  let userInfo
  try {
    userInfo = await exchangeSsoCode({
      provider,
      code,
      codeVerifier: stored.code_verifier,
      redirectUri: `${stored.redirect_origin}/api/auth/sso/${provider}/callback`,
      appleUser,
    })
  } catch (err) {
    return { type: 'error', error: 'token_exchange_failed', log: [`[sso/${provider}] token exchange:`, err.message] }
  }

  if (!userInfo?.email) return { type: 'error', error: 'no_email' }

  let existingProfile
  try {
    const { profile, error } = await findProfileByEmail(userInfo.email, 'id,role,first_name,last_name,is_active,is_deleted')
    if (error) throw error
    existingProfile = profile
  } catch (err) {
    return { type: 'error', error: 'account_error', log: [`[sso/${provider}] profile lookup:`, err.message] }
  }

  if (!existingProfile) return { type: 'signup', provider, userInfo }

  let hasPaid = false
  try {
    const paid = await hasActiveSubscription(existingProfile.id)
    if (paid.error) throw paid.error
    hasPaid = paid.hasPaid
  } catch (err) {
    return { type: 'error', error: 'account_error', log: [`[sso/${provider}] subscription lookup:`, err.message] }
  }

  const isActive = accountActive(existingProfile, hasPaid)
  if (!isActive || existingProfile.is_deleted) {
    return {
      type: 'signup',
      provider,
      userInfo: {
        email: userInfo.email,
        firstName: userInfo.firstName || existingProfile.first_name || '',
        lastName: userInfo.lastName || existingProfile.last_name || '',
      },
    }
  }

  const role = existingProfile.role ?? 'employee'
  return {
    type: 'session',
    destination: homePathForRole(role),
    session: {
      userId: existingProfile.id,
      email: userInfo.email,
      role,
      authMethod: 'sso',
    },
  }
}
