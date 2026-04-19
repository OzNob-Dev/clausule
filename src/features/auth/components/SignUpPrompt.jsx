import Link from 'next/link'

export default function SignUpPrompt() {
  return (
    <>
      <div className="si-divider">
        <div className="si-divider-line" />
        <span className="si-divider-text">No account yet?</span>
        <div className="si-divider-line" />
      </div>
      <p className="si-footer">
        <Link href="/signup">Sign up</Link>
      </p>
    </>
  )
}
