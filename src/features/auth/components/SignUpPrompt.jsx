import Link from 'next/link'
import { authShell } from '@features/signup/components/signupClasses'

export default function SignUpPrompt() {
  return (
    <p className={authShell.signinNote}>
      No account yet?{' '}
      <Link href="/signup" className={authShell.signinLink}>Sign up</Link>
    </p>
  )
}
