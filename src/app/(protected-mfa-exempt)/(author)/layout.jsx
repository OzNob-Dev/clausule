import { headers } from 'next/headers'
import { getServerBootstrapSession } from '@auth/server/serverSession.js'
import AuthorShell from '@shared/components/layout/AuthorShell'
import { ROUTES } from '@shared/utils/routes'

async function getPathname() {
  return (await headers()).get('x-clausule-pathname') ?? ROUTES.home
}

export default async function AuthorMfaExemptLayout({ children }) {
  const [pathname, session] = await Promise.all([getPathname(), getServerBootstrapSession()])
  return <AuthorShell pathname={pathname} session={session}>{children}</AuthorShell>
}
