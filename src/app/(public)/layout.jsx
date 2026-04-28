import { Link } from '@shared/components/ui/Link'
import { ROUTES } from '@shared/utils/routes'

const navItems = [
  { href: ROUTES.pricing, label: 'Pricing' },
  { href: ROUTES.login, label: 'Login' },
  { href: ROUTES.register, label: 'Register' },
]

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(208,90,52,0.14),transparent_28%),linear-gradient(180deg,#fbf7f2_0%,#f5f0ea_100%)] text-tp">
      <header className="border-b border-rule/70 bg-[rgba(251,247,242,0.82)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.32em] text-tp no-underline">
            Clausule
          </Link>
          <nav className="flex flex-wrap items-center gap-3" aria-label="Public">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} variant="subtle" className="text-sm">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
