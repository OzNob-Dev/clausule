import { AppShell } from '@shared/components/layout/AppShell'
import { Card } from '@shared/components/ui/Card'
import { Link } from '@shared/components/ui/Link'
import { ROUTES } from '@shared/utils/routes'

const items = [
  { href: ROUTES.brag, title: 'Brag doc', body: 'Collect proof, entries, and feedback in the author workspace.' },
  { href: ROUTES.profile, title: 'Profile', body: 'Keep identity and contact data current for the account.' },
  { href: ROUTES.bragSettings, title: 'Settings', body: 'Manage security controls, TOTP, and account deletion.' },
]

export default function Page() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-acc">Protected zone</p>
        <h1 className="mt-4 font-serif text-4xl text-tp sm:text-5xl">Dashboard</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-ts">
          Entry point for authenticated users. Use this shell to branch into the deeper author, profile, and settings areas.
        </p>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.href} tone="elevated" padding="lg" className="flex h-full flex-col">
              <h2 className="text-xl font-semibold text-tp">{item.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-ts">{item.body}</p>
              <div className="mt-6">
                <Link href={item.href} variant="button">
                  Open
                </Link>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  )
}
