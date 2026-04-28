import Link from 'next/link'
import { Link } from '@shared/components/ui/Link'
import { ROUTES } from '@shared/utils/routes'

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12 text-[#1A1510]">
      <Link href="/signup" className="text-sm font-semibold text-[#5B4E42]">Back to signup</Link>
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#786B5F]">Clausule</p>
        <h1 className="text-4xl font-black tracking-[-0.04em]">Terms of Service</h1>
        <p className="max-w-2xl text-sm leading-7 text-[#3D3228]">
          These terms cover access to Clausule, acceptable use, account ownership, and cancellation. They apply whenever you create or use an account.
        </p>
      </header>
      <section className="space-y-4 text-sm leading-7 text-[#3D3228]">
        <p>You are responsible for the accuracy of the information you store, for keeping your sign-in methods secure, and for using the product lawfully.</p>
        <p>Clausule may suspend or remove access if the product is misused, if security is threatened, or if the service is used to store unlawful material.</p>
        <p>Subscription and billing terms for paid plans will be shown in-product before payment collection is enabled. Until then, signup copy in the app must state clearly when checkout is unavailable.</p>
        <p>Questions about these terms can be sent to <Link href="mailto:help@clausule.com" className="font-semibold text-[#1A1510]">help@clausule.com</Link>.</p>
      </section>
      <footer className="pt-4 text-sm text-[#5B4E42]">
        Read the companion <Link href={ROUTES.privacy} className="font-semibold text-[#1A1510]">Privacy Policy</Link>.
      </footer>
    </main>
  )
}
