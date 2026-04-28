import { Card } from '@shared/components/ui/Card'
import { Link } from '@shared/components/ui/Link'

const highlights = [
  ['Public landing', 'Clear entry point for visitors, with direct paths to login and registration.'],
  ['Protected zones', 'Server-authenticated layouts and middleware guard the app shell.'],
  ['Route groups', 'Separate public, auth, and protected concerns without URL noise.'],
]

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col justify-center px-6 py-16 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-acc">Public zone</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-tp sm:text-6xl lg:text-7xl">
            Route every visitor through the right experience.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-ts sm:text-lg">
            Clausule now splits public, auth, and protected flows cleanly so marketing, onboarding, and authenticated work stay isolated without extra URL noise.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" variant="button">
              Get started
            </Link>
            <Link href="/login" variant="subtle" className="px-1 py-2 text-sm font-semibold">
              Sign in
            </Link>
          </div>
        </div>

        <Card tone="elevated" padding="lg" className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,240,234,0.92))]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tc">Structure</p>
          <div className="mt-5 grid gap-4">
            {highlights.map(([title, body]) => (
              <div key={title} className="rounded-[1.25rem] border border-rule bg-card/90 p-4">
                <h2 className="text-base font-semibold text-tp">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ts">{body}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  )
}
