import Link from 'next/link'

export default function SignUpPrompt() {
  return (
    <p className="su-shell-signin-note">
      No account yet?{' '}
      <Link href="/signup">Sign up</Link>
    </p>
  )
}
