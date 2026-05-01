import { headers } from 'next/headers'
import SignupShell from '@shared/components/layout/SignupShell'
import { ROUTES } from '@shared/utils/routes'

async function getPathname() {
  return (await headers()).get('x-clausule-pathname') ?? ROUTES.home
}

export default async function SignupLayout({ children }) {
  const pathname = await getPathname()
  return <SignupShell pathname={pathname}>{children}</SignupShell>
}
