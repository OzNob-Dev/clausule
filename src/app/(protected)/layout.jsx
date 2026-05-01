import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@auth/context/AuthContext'
import { getServerBootstrapSession } from '@auth/server/serverSession.js'
import { AppShell } from '@shared/components/layout/AppShell'
import DevAccessGate from '@shared/components/layout/DevAccessGate'
import { isManagerRoute, isMfaExemptPath } from '@shared/utils/routePolicy'
import { ROUTES } from '@shared/utils/routes'

async function getPathname() {
  return (await headers()).get('x-clausule-pathname') ?? ROUTES.home
}

export default async function ProtectedLayout({ children }) {
  const [pathname, session] = await Promise.all([getPathname(), getServerBootstrapSession()])
  if (!session) redirect(ROUTES.login)

  const mfaSetupRequired = !session.security.authenticatorAppConfigured && !session.security.ssoConfigured
  if (mfaSetupRequired && !isMfaExemptPath(pathname)) redirect(ROUTES.settings)
  if (isManagerRoute(pathname) && session.user.role !== 'manager') redirect(ROUTES.brag)

  return (
    <AuthProvider initialSession={session}>
      <DevAccessGate>
        <AppShell>{children}</AppShell>
      </DevAccessGate>
    </AuthProvider>
  )
}
