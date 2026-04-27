import { redirect } from 'next/navigation'
import SignupDoneScreen from '@features/signup/SignupDoneScreen'
import { getServerAuth } from '@features/auth/server/serverSession.js'
import { homePathForRole } from '@shared/utils/routes'

export default async function Page({ searchParams }) {
  const auth = await getServerAuth()
  if (!auth.error && auth.role) redirect(homePathForRole(auth.role))

  const { email = '' } = await searchParams
  if (!email) redirect('/signup')

  return <SignupDoneScreen email={email} />
}
