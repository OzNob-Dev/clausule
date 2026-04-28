import { redirect } from 'next/navigation'
import SignupDoneScreen from '@signup/SignupDoneScreen'

export default async function Page({ searchParams }) {
  const { email = '' } = await searchParams
  if (!email) redirect('/signup')

  return <SignupDoneScreen email={email} />
}
