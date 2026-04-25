import Link from 'next/link'
import { ROUTES } from '@shared/utils/routes'

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12 text-[#1A1510]">
      <Link href="/signup" className="text-sm font-semibold text-[#5B4E42]">Back to signup</Link>
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#786B5F]">Clausule</p>
        <h1 className="text-4xl font-black tracking-[-0.04em]">Privacy Policy</h1>
        <p className="max-w-2xl text-sm leading-7 text-[#3D3228]">
          Clausule stores the account, profile, and work-record information needed to operate the product and secure sign-in.
        </p>
      </header>
      <section className="space-y-4 text-sm leading-7 text-[#3D3228]">
        <p>We collect profile details, sign-in metadata, brag entries, and product feedback that you submit through the app.</p>
        <p>We use that data to provide the service, protect accounts, respond to support requests, and improve the product.</p>
        <p>Access is limited to the people and systems that need it to run Clausule. Product feedback is kept separate from your brag document and routed only to the app owners.</p>
        <p>You can request account deletion from the protected settings area or contact <a className="font-semibold text-[#1A1510]" href="mailto:help@clausule.com">help@clausule.com</a> for privacy questions.</p>
      </section>
      <footer className="pt-4 text-sm text-[#5B4E42]">
        Read the companion <Link href={ROUTES.terms} className="font-semibold text-[#1A1510]">Terms of Service</Link>.
      </footer>
    </main>
  )
}
