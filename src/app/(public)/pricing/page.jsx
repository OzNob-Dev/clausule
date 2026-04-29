import { DM_Serif_Display } from 'next/font/google'
import { Card } from '@shared/components/ui/Card'
import { Link } from '@shared/components/ui/Link'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const plans = [
  { name: 'Starter', price: 'Free', details: 'Landing pages, public routes, and a single workspace.' },
  { name: 'Pro', price: 'Contact sales', details: 'Protected app shell, dashboards, and team workflows.' },
  { name: 'Enterprise', price: 'Custom', details: 'Advanced controls, security review, and rollout support.' },
]

export default function Page() {
  return (
    <main className={`${dmSerif.variable} mx-auto max-w-7xl px-6 py-16 lg:px-8`}>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-acc">Pricing</p>
        <h1 className="mt-4 font-serif text-4xl text-tp sm:text-5xl">Simple route for public, auth, and protected usage.</h1>
        <p className="mt-5 text-base leading-8 text-ts">
          The app structure is the product here. Pricing stays informational until checkout or billing is intentionally added.
        </p>
      </div>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} tone="elevated" padding="lg" className="h-full">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tc">{plan.name}</p>
            <p className="mt-4 text-3xl font-black text-tp">{plan.price}</p>
            <p className="mt-4 text-sm leading-7 text-ts">{plan.details}</p>
            <div className="mt-6">
              <Link href="/register" variant="button">
                Choose {plan.name}
              </Link>
            </div>
          </Card>
        ))}
      </section>
    </main>
  )
}
