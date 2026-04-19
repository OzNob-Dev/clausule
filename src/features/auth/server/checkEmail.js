import { getAuthUser, select } from '@api/_lib/supabase.js'

const NOT_FOUND_RESULT = {
  exists: false,
  isActive: false,
  isDeleted: false,
  hasMfa: false,
  hasSso: false,
  ssoProvider: null,
  hasPaid: false,
}

function profileQuery(email) {
  return new URLSearchParams({ email: `ilike.${email}`, select: 'id,totp_secret,is_active,is_deleted', limit: '1' }).toString()
}

function paidQuery(userId) {
  return new URLSearchParams({
    user_id: `eq.${userId}`,
    status: 'in.(active,trialing)',
    select: 'id',
    limit: '1',
  }).toString()
}

export function ssoProvider(user) {
  const provider = user?.app_metadata?.provider
  if (provider && provider !== 'email') return provider
  return user?.identities?.find((identity) => identity?.provider && identity.provider !== 'email')?.provider ?? null
}

export async function checkEmailAccount(email) {
  const { data: profiles, error: profileError } = await select('profiles', profileQuery(email))
  if (profileError) return { error: profileError, log: 'profile lookup failed' }

  if (!Array.isArray(profiles) || profiles.length === 0) return { result: NOT_FOUND_RESULT }

  const profile = profiles[0]
  const { data: paidRows, error: paidError } = await select('subscriptions', paidQuery(profile.id))
  if (paidError) return { error: paidError, log: 'subscription lookup failed' }

  const hasPaid = Array.isArray(paidRows) && paidRows.length > 0
  const { data: authUser, error: authError } = await getAuthUser(profile.id)
  if (authError) return { error: authError, log: 'auth user lookup failed' }

  const provider = ssoProvider(authUser?.user ?? authUser)

  return {
    result: {
      exists: true,
      isActive: Boolean(profile.is_active) || hasPaid,
      isDeleted: Boolean(profile.is_deleted),
      hasMfa: Boolean(profile.totp_secret),
      hasSso: Boolean(provider),
      ssoProvider: provider,
      hasPaid,
    },
  }
}
