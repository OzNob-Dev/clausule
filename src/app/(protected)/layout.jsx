import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@features/auth/context/AuthContext'
import { getServerBootstrapSession } from '@features/auth/server/serverSession.js'
import { ROUTES } from '@shared/utils/routes'

export default async function ProtectedLayout({ children }) {
  const session = await getServerBootstrapSession()
  if (!session) redirect('/')

  const pathname = (await headers()).get('x-clausule-pathname') ?? ''
  const mfaSetupRequired = !session.security.authenticatorAppConfigured && !session.security.ssoConfigured

  if (mfaSetupRequired && pathname !== ROUTES.bragSettings) {
    redirect(ROUTES.bragSettings)
  }

  return <AuthProvider initialSession={session}>{children}</AuthProvider>
}
