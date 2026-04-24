import { getAuthUser, select } from '@api/_lib/supabase.js'

export const ACTIVE_SUBSCRIPTION_STATUS = 'in.(active,trialing)'

export function profileByEmailQuery(email, selectFields = 'id,role') {
  return new URLSearchParams({ email: `eq.${email.toLowerCase()}`, select: selectFields, limit: '1' }).toString()
}

export function profileByIdQuery(userId, selectFields = 'id,email,role') {
  return new URLSearchParams({ id: `eq.${userId}`, select: selectFields, limit: '1' }).toString()
}

export function activeSubscriptionQuery(userId) {
  return new URLSearchParams({
    user_id: `eq.${userId}`,
    status: ACTIVE_SUBSCRIPTION_STATUS,
    select: 'id',
    limit: '1',
  }).toString()
}

export async function findProfileByEmail(email, selectFields = 'id,role') {
  const { data, error } = await select('profiles', profileByEmailQuery(email, selectFields))
  return { profile: data?.[0] ?? null, error }
}

export async function findProfileById(userId, selectFields = 'id,email,role') {
  const { data, error } = await select('profiles', profileByIdQuery(userId, selectFields))
  return { profile: data?.[0] ?? null, error }
}

export async function hasActiveSubscription(userId) {
  const { data, error } = await select('subscriptions', activeSubscriptionQuery(userId))
  return { hasPaid: Array.isArray(data) && data.length > 0, error }
}

export function ssoProviderForAuthUser(user) {
  const provider = user?.app_metadata?.provider
  if (provider && provider !== 'email') return provider
  return user?.identities?.find((identity) => identity?.provider && identity.provider !== 'email')?.provider ?? null
}

export async function getAuthUserDetails(userId) {
  const { data, error } = await getAuthUser(userId)
  const user = data?.user ?? data
  return { user, provider: ssoProviderForAuthUser(user), error }
}

export async function getUserSsoProvider(userId) {
  const { provider, error } = await getAuthUserDetails(userId)
  return { provider, error }
}

export function accountActive(profile, hasPaid) {
  return Boolean(profile?.is_active) || hasPaid
}
