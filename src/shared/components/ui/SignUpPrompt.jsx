import { Link } from './Link'
import { authSigninNoteClassName } from '@shared/components/layout/authShellClasses'
export default function SignUpPrompt() {
  return (
    <p className={`${authSigninNoteClassName} mt-5`}>
      No account yet?{' '}
      <Link href="/signup" className="font-semibold no-underline text-[var(--cl-ink-2)] hover:text-[var(--su-tx1)]">Sign up</Link>
    </p>
  )
}
