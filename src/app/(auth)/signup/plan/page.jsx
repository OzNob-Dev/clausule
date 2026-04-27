import { redirect } from 'next/navigation'
import SignupPlanScreen from '@features/signup/SignupPlanScreen'
import { getServerAuth } from '@features/auth/server/serverSession.js'
import { homePathForRole } from '@shared/utils/routes'

export default async function Page({ searchParams }) {
  const auth = await getServerAuth()
  if (!auth.error && auth.role) redirect(homePathForRole(auth.role))

  const { email = '', firstName = '', lastName = '' } = await searchParams
  if (!email) redirect('/signup')

  return <SignupPlanScreen accountData={{ email, firstName, lastName }} />
}
