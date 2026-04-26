import { redirect } from 'next/navigation'
import { AuthProvider } from '@features/auth/context/AuthContext'
import { getServerBootstrapSession } from '@features/auth/server/serverSession.js'

export default async function MfaExemptLayout({ children }) {
  const session = await getServerBootstrapSession()
  if (!session) redirect('/')
  return <AuthProvider initialSession={session}>{children}</AuthProvider>
}
