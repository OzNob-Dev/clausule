import { DM_Serif_Display } from 'next/font/google'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@auth/context/AuthContext'
import { getServerBootstrapSession } from '@auth/server/serverSession.js'
import { MANAGER_ROUTES, ROUTES } from '@shared/utils/routes'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

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

  return <div className={dmSerif.variable}><AuthProvider initialSession={session}>{children}</AuthProvider></div>
}
