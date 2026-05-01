import { Link } from './Link'
export default function SignUpPrompt() {
  return (
    <p className="su-shell-signin-note mt-5 text-center text-[var(--cl-text-xs)] leading-[1.6] text-[var(--cl-surface-muted-8)]">
      No account yet?{' '}
      <Link href="/signup" className="font-semibold no-underline text-[var(--cl-ink-2)] hover:text-[var(--su-tx1)]">Sign up</Link>
    </p>
  )
}
