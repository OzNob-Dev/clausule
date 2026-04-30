import { Link } from './Link'
import './SignUpPrompt.css'
export default function SignUpPrompt() {
  return (
    <p className="su-shell-signin-note">
      No account yet?{' '}
      <Link href="/signup">Sign up</Link>
    </p>
  )
}
