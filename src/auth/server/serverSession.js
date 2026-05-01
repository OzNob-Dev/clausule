import { cookies } from 'next/headers'
import { requireActiveAuth, requireActiveAuthProfile } from '@api/_lib/auth.js'
import { BOOTSTRAP_PROFILE_FIELDS, bootstrapSession } from './bootstrapSession.js'
import { authTestBypassBootstrap, authTestBypassUser, isAuthTestBypassEnabled } from '@shared/utils/authTestBypass.js'

function authRequestFromCookieHeader(cookieHeader) {
  return new Request('http://localhost', {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  })
}

export async function getServerAuth() {
  if (isAuthTestBypassEnabled()) {
    return { ...authTestBypassUser, error: null }
  }

  const cookieStore = await cookies()
  return requireActiveAuth(authRequestFromCookieHeader(cookieStore.toString()))
}

export async function getServerBootstrapSession() {
  if (isAuthTestBypassEnabled()) return authTestBypassBootstrap

  const cookieStore = await cookies()
  const auth = await requireActiveAuthProfile(
    authRequestFromCookieHeader(cookieStore.toString()),
    BOOTSTRAP_PROFILE_FIELDS
  )
  if (auth.error) return null

  const result = await bootstrapSession(auth)
  return result.status === 200 ? result.body : null
}
