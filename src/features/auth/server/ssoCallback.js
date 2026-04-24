import crypto from 'node:crypto'
import { homePathForRole } from '@shared/utils/routes'
import { accountActive, findProfileByEmail, hasActiveSubscription } from './accountRepository.js'
import { exchangeSsoCode } from './ssoProviders.js'

function ssoStateSecret() {
  return process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'clausule-dev-sso-state'
}

function verifySignedState(rawValue) {
  const dotIdx = rawValue.lastIndexOf('.')
  if (dotIdx === -1) return null
  const body = rawValue.slice(0, dotIdx)
  const sig = rawValue.slice(dotIdx + 1)
  const expected = crypto.createHmac('sha256', ssoStateSecret()).update(body).digest('base64url')
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null
  }
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export function parseSsoState(cookieHeader) {
  const rawCookie = (cookieHeader ?? '')
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('sso_state='))

  if (!rawCookie) return { error: 'state_mismatch' }

  try {
    const state = verifySignedState(decodeURIComponent(rawCookie.split('=').slice(1).join('=')))
    return state ? { state } : { error: 'invalid_state' }
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
