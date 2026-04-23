import Link from 'next/link'

export default function SignUpPrompt() {
  return (
    <>
      <div className="flex items-center gap-3 my-[22px]">
        <div className="flex-1 h-[1px] bg-rule" />
        <span className="text-[11px] text-tm">No account yet?</span>
        <div className="flex-1 h-[1px] bg-rule" />
      </div>
      <p className="text-[11px] text-center text-tm mt-5 leading-[1.6]">
        <Link href="/signup" className="text-ts no-underline font-semibold">Sign up</Link>
      </p>
    </>
  )
}
