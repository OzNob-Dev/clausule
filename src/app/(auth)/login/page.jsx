import { redirect } from 'next/navigation'
import SignInScreen from '@auth/SignInScreen'
import { getServerAuth } from '@auth/server/serverSession.js'
import { homePathForRole } from '@shared/utils/routes'

export default async function Page() {
  const auth = await getServerAuth()
  if (!auth.error && auth.role) redirect(homePathForRole(auth.role))
  return <SignInScreen />
}
