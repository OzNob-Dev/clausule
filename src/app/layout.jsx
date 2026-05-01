import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@auth/context/AuthContext'
import { getServerBootstrapSession } from '@auth/server/serverSession.js'
import { QueryProvider } from '@shared/providers/QueryProvider'
import DevAccessGate from '@shared/components/layout/DevAccessGate'
import RouteShell from '@shared/components/layout/RouteShell'
import {
  isManagerRoute,
  isMfaExemptPath,
  isProtectedPath,
} from '@shared/utils/routePolicy'
import { ROUTES } from '@shared/utils/routes'
import '@shared/styles/globals.css'

export const metadata = {
  title: 'Clausule',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.ico',
  },
}

async function getPathname() {
  return (await headers()).get('x-clausule-pathname') ?? ROUTES.home
}

async function getProtectedSession(pathname) {
  if (!isProtectedPath(pathname)) return null

  const session = await getServerBootstrapSession()
  if (!session) redirect(ROUTES.login)

  const mfaSetupRequired = !session.security.authenticatorAppConfigured && !session.security.ssoConfigured
  if (mfaSetupRequired && !isMfaExemptPath(pathname)) redirect(ROUTES.settings)
  if (isManagerRoute(pathname) && session.user.role !== 'manager') redirect(ROUTES.brag)

  return session
}

export default async function RootLayout({ children }) {
  const pathname = await getPathname()
  const session = await getProtectedSession(pathname)
  const content = <RouteShell initialPathname={pathname}>{children}</RouteShell>

  return (
    <html lang="en">
      <body>
        <DevAccessGate>
          <QueryProvider>
            {session ? <AuthProvider initialSession={session}>{content}</AuthProvider> : content}
          </QueryProvider>
        </DevAccessGate>
      </body>
    </html>
  )
}
