import { redirect } from 'next/navigation'
import SignupScreen from '@signup/SignupScreen'
import { getServerAuth } from '@auth/server/serverSession.js'
import { homePathForRole } from '@shared/utils/routes'

export default async function Page() {
  const auth = await getServerAuth()
  if (!auth.error && auth.role) redirect(homePathForRole(auth.role))
  return <SignupScreen />
}
