import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@auth/context/AuthContext'
import { getServerBootstrapSession } from '@auth/server/serverSession.js'
import { MANAGER_ROUTES, ROUTES } from '@shared/utils/routes'

export default async function ProtectedLayout({ children }) {
  const session = await getServerBootstrapSession()
  if (!session) redirect(ROUTES.login)

  const pathname = (await headers()).get('x-clausule-pathname') ?? ''
  const mfaSetupRequired = !session.security.authenticatorAppConfigured && !session.security.ssoConfigured
  if (mfaSetupRequired && pathname !== ROUTES.settings && pathname !== ROUTES.bragSettings) redirect(ROUTES.settings)

  const isManagerRoute = MANAGER_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  )
  if (isManagerRoute && session.user.role !== 'manager') redirect(ROUTES.brag)

  return <AuthProvider initialSession={session}>{children}</AuthProvider>
}
