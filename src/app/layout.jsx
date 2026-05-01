import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@auth/context/AuthContext'
import { getServerBootstrapSession } from '@auth/server/serverSession.js'
import { QueryProvider } from '@shared/providers/QueryProvider'
import DevAccessGate from '@shared/components/layout/DevAccessGate'
import AuthorShell from '@shared/components/layout/AuthorShell'
import LoginShell from '@shared/components/layout/LoginShell'
import PublicShell from '@shared/components/layout/PublicShell'
import {
  isAuthShellPath,
  isAuthorShellPath,
  isManagerRoute,
  isMfaExemptPath,
  isProtectedPath,
  isPublicShellPath,
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

function renderShell(children, pathname) {
  if (pathname.startsWith('/login')) return children
  if (pathname.startsWith('/signup')) return children
  if (pathname.startsWith('/mfa-setup')) return children
  if (isAuthShellPath(pathname)) return <LoginShell>{children}</LoginShell>
  if (isAuthorShellPath(pathname)) return <AuthorShell pathname={pathname} session={null}>{children}</AuthorShell>
  if (isPublicShellPath(pathname)) return <PublicShell>{children}</PublicShell>
  return children
}

export default async function RootLayout({ children }) {
  const pathname = await getPathname()
  const session = await getProtectedSession(pathname)
  const content = isAuthorShellPath(pathname)
    ? <AuthorShell pathname={pathname} session={session}>{children}</AuthorShell>
    : renderShell(children, pathname)
  const needsClientProviders = isProtectedPath(pathname) || isAuthShellPath(pathname)

  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {needsClientProviders ? (
            <DevAccessGate>
              <AuthProvider initialSession={session}>{content}</AuthProvider>
            </DevAccessGate>
          ) : content}
        </QueryProvider>
      </body>
    </html>
  )
}
