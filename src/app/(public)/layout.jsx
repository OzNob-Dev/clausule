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
      {children}
    </div>
  )
}
