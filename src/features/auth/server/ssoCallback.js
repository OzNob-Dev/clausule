import { select } from '@api/_lib/supabase.js'
import { homePathForRole } from '@shared/utils/routes'
import { exchangeSsoCode } from './ssoProviders.js'

function profileQuery(email) {
  return new URLSearchParams({
    email: `ilike.${email}`,
    select: 'id,role,first_name,last_name,is_active,is_deleted',
    limit: '1',
  }).toString()
}

function subscriptionQuery(userId) {
  return new URLSearchParams({
    user_id: `eq.${userId}`,
    status: 'in.(active,trialing)',
    select: 'id',
    limit: '1',
  }).toString()
}

export function parseSsoState(cookieHeader) {
  const rawCookie = (cookieHeader ?? '')
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('sso_state='))

  if (!rawCookie) return { error: 'state_mismatch' }

  try {
    return { state: JSON.parse(decodeURIComponent(rawCookie.split('=').slice(1).join('='))) }
  } catch {
    return { error: 'invalid_state' }
  }
}

export async function resolveSsoCallback({ origin, provider, code, state, cookieHeader, appleUser }) {
  if (!code || !state) return { type: 'error', error: 'missing_params' }

  const parsed = parseSsoState(cookieHeader)
  if (parsed.error) return { type: 'error', error: parsed.error }

  const stored = parsed.state
  if (stored.state !== state || stored.provider !== provider) {
    return { type: 'error', error: 'state_mismatch' }
  }

  let userInfo
  try {
    userInfo = await exchangeSsoCode({
      provider,
      code,
      codeVerifier: stored.codeVerifier,
      redirectUri: `${origin}/api/auth/sso/${provider}/callback`,
      appleUser,
    })
  } catch (err) {
    return { type: 'error', error: 'token_exchange_failed', log: [`[sso/${provider}] token exchange:`, err.message] }
  }

  if (!userInfo?.email) return { type: 'error', error: 'no_email' }

  let existingProfile
  try {
    const { data } = await select('profiles', profileQuery(userInfo.email))
    existingProfile = data?.[0] ?? null
  } catch (err) {
    return { type: 'error', error: 'account_error', log: [`[sso/${provider}] profile lookup:`, err.message] }
  }

  if (!existingProfile) return { type: 'signup', provider, userInfo }

  let hasPaid = false
  try {
    const { data } = await select('subscriptions', subscriptionQuery(existingProfile.id))
    hasPaid = Array.isArray(data) && data.length > 0
  } catch (err) {
    return { type: 'error', error: 'account_error', log: [`[sso/${provider}] subscription lookup:`, err.message] }
  }

  const isActive = Boolean(existingProfile.is_active) || hasPaid
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
