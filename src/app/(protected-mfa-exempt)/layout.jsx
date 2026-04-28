import { redirect } from 'next/navigation'
import { AuthProvider } from '@auth/context/AuthContext'
import { getServerBootstrapSession } from '@auth/server/serverSession.js'
import { ROUTES } from '@shared/utils/routes'

export default async function MfaExemptLayout({ children }) {
  const session = await getServerBootstrapSession()
  if (!session) redirect(ROUTES.login)
  return <AuthProvider initialSession={session}>{children}</AuthProvider>
}
