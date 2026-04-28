import { findProfileById, getAuthUserDetails } from './accountRepository.js'
import { reconcileProfileEmail } from './reconcileProfileEmail.js'

/** @typedef {import('@shared/types/contracts').AuthBootstrap} AuthBootstrap */

function authMetaName(user, key) {
  return user?.user_metadata?.[key] ?? user?.raw_user_meta_data?.[key] ?? ''
}

/**
 * @param {{ userId: string, email: string, role: import('@shared/types/contracts').Role, authMethod: import('@shared/types/contracts').AuthMethod }} param0
 * @returns {Promise<{ body: AuthBootstrap, status: 200 }>}
 */
export async function bootstrapSession({ userId, email, role, authMethod }) {
  const { profile, error } = await findProfileById(userId, 'first_name,last_name,email,mobile,job_title,department,totp_secret')
  if (error) console.error('[auth/bootstrap GET]', error)

  const { user, provider, error: authUserError } = await getAuthUserDetails(userId)
  if (authUserError) console.error('[auth/bootstrap auth user GET]', authUserError)
  const canonicalEmail = user?.email ?? email ?? ''
  const reconciled = await reconcileProfileEmail({
    userId,
    profileEmail: profile?.email ?? '',
    authEmail: canonicalEmail,
  })
  if (reconciled.error) console.error('[auth/bootstrap reconcile email]', reconciled.error)

  return {
    body: {
      user: { id: userId, email: canonicalEmail, role },
      profile: {
        firstName: profile?.first_name || authMetaName(user, 'first_name'),
        lastName: profile?.last_name || authMetaName(user, 'last_name'),
        email: reconciled.email || canonicalEmail,
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
