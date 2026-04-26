import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@features/auth/context/AuthContext'
import { getServerBootstrapSession } from '@features/auth/server/serverSession.js'
import { MANAGER_ROUTES, ROUTES } from '@shared/utils/routes'

export default async function ProtectedLayout({ children }) {
  const session = await getServerBootstrapSession()
  console.log('[protected-layout] session:', !!session, session?.user?.email)
  if (!session) {
    console.log('[protected-layout] no session, redirecting to /')
    redirect('/')
  }

  const pathname = (await headers()).get('x-clausule-pathname') ?? ''
  const mfaSetupRequired = !session.security.authenticatorAppConfigured && !session.security.ssoConfigured

  console.log('[protected-layout] mfaSetupRequired:', mfaSetupRequired, 'pathname:', JSON.stringify(pathname))
  if (mfaSetupRequired && pathname !== ROUTES.bragSettings) {
    console.log('[protected-layout] mfa required, redirecting to settings from pathname:', pathname)
    redirect(ROUTES.bragSettings)
  }

  const isManagerRoute = MANAGER_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  )
  if (isManagerRoute && session.user.role !== 'manager') {
    console.log('[protected-layout] non-manager accessing manager route, redirecting')
    redirect(ROUTES.brag)
  }

  return <AuthProvider initialSession={session}>{children}</AuthProvider>
}
