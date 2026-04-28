'use client'

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react'
import { Avatar } from '@shared/components/ui/Avatar'
import { Button } from '@shared/components/ui/Button'
import { CategoryDot, CategoryPill } from '@shared/components/ui/CategoryPill'
import { CodeEmail } from '@shared/components/ui/CodeEmail'
import { Modal } from '@shared/components/ui/Modal'
import PageLoader from '@shared/components/ui/PageLoader'
import { ThinkingDots } from '@shared/components/ui/ThinkingDots'
import { SsoProviderIcon } from '@shared/components/SsoProviderIcon'
import { cn } from '@shared/utils/cn'
import { LAYER_ORDER } from './componentRegistry'

const layerLabels = {
  all: 'All',
  atoms: 'Atoms',
  molecules: 'Molecules',
  organisms: 'Organisms',
  templates: 'Templates',
  pages: 'Pages',
}

const buttonVariants = ['primary', 'ghost', 'danger', 'confirm']
const buttonSizes = ['sm', 'md', 'lg']
const avatarSizes = ['sm', 'md', 'lg']
const pageLoaderVariants = ['signup', 'auth', 'brag', 'feedback', 'settings', 'profile', 'mfa']
const categoryOptions = ['perf', 'conduct', 'dev']
const providerOptions = ['google', 'microsoft', 'apple']
const avatarPalettes = [
  { label: 'Warm', bg: '#7F351F', fg: '#FAF7F3' },
  { label: 'Forest', bg: '#225F3D', fg: '#FAF7F3' },
  { label: 'Stone', bg: '#4D4035', fg: '#FAF7F3' },
]

function controlClass(active) {
  return cn(
    'rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc',
    active ? 'border-acc bg-acc text-canvas' : 'border-rule bg-card text-ts hover:bg-white/60'
  )
}

function MetaRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-rule bg-card/80 p-4">
      <dt className="text-[11px] uppercase tracking-[0.28em] text-tc">{label}</dt>
      <dd className="mt-2 break-words text-sm text-tp">{value}</dd>
    </div>
  )
}

function GenericPreview({ entry }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-rule bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0.35))] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-tc">{entry.layer}</p>
      <h3 className="mt-3 font-serif text-2xl text-tp">{entry.label}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-ts">{entry.note}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-card p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Owner</p>
          <p className="mt-2 text-sm font-semibold text-tp">{entry.owner}</p>
        </div>
        <div className="rounded-2xl border border-rule bg-card p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Preview</p>
          <p className="mt-2 text-sm text-tp">Generic card used when no bespoke playground control is needed.</p>
        </div>
      </div>
    </div>
  )
}

function ButtonPreview() {
  const [variant, setVariant] = useState('primary')
  const [size, setSize] = useState('md')

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-sm text-ts">
          <span className="text-[11px] uppercase tracking-[0.24em]">Variant</span>
          <select value={variant} onChange={(e) => setVariant(e.target.value)} className="rounded-xl border border-rule bg-card px-3 py-2 text-sm text-tp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc">
            {buttonVariants.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-ts">
          <span className="text-[11px] uppercase tracking-[0.24em]">Size</span>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="rounded-xl border border-rule bg-card px-3 py-2 text-sm text-tp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc">
            {buttonSizes.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant={variant} size={size}>Save changes</Button>
        <Button variant="ghost" size="sm">Secondary action</Button>
      </div>
    </div>
  )
}

function AvatarPreview() {
  const [size, setSize] = useState('md')
  const [palette, setPalette] = useState(0)
  const swatch = avatarPalettes[palette]

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {avatarSizes.map((option) => (
          <button key={option} type="button" className={controlClass(size === option)} onClick={() => setSize(option)}>
            {option}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {avatarPalettes.map((option, index) => (
          <button key={option.label} type="button" className={controlClass(palette === index)} onClick={() => setPalette(index)}>
            {option.label}
          </button>
        ))}
      </div>
      <Avatar initials="AL" size={size} bg={swatch.bg} color={swatch.fg} />
    </div>
  )
}

function ModalPreview() {
  const [open, setOpen] = useState(false)

  return (
    <div className="grid gap-4">
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <p className="max-w-lg text-sm leading-6 text-ts">Open the dialog to verify focus trapping, escape handling, and inert background behavior.</p>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm component usage"
        footer={<Button type="button" variant="ghost" onClick={() => setOpen(false)}>Close</Button>}
      >
        <p className="text-sm leading-6 text-tp">The modal preview is live. Keyboard focus should move into the dialog and return when it closes.</p>
      </Modal>
    </div>
  )
}

function CodeEmailPreview() {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => setRevealed((value) => !value)}>{revealed ? 'Hide code' : 'Reveal code'}</Button>
        <span className="text-sm text-ts">Toggle email digits without changing layout.</span>
      </div>
      <CodeEmail to="ada@example.com" code="246810" revealed={revealed} />
    </div>
  )
}

function PageLoaderPreview() {
  const [variant, setVariant] = useState('brag')

  return (
    <div className="grid gap-5">
      <label className="grid gap-1 text-sm text-ts">
        <span className="text-[11px] uppercase tracking-[0.24em]">Variant</span>
        <select value={variant} onChange={(e) => setVariant(e.target.value)} className="rounded-xl border border-rule bg-card px-3 py-2 text-sm text-tp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc">
          {pageLoaderVariants.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <div className="rounded-[1.75rem] border border-rule bg-card p-4">
        <PageLoader variant={variant} />
      </div>
    </div>
  )
}

function CategoryPreview() {
  const [cat, setCat] = useState('perf')
  const [showDot, setShowDot] = useState(true)

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((option) => (
          <button key={option} type="button" className={controlClass(cat === option)} onClick={() => setCat(option)}>
            {option}
          </button>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-ts">
        <input type="checkbox" checked={showDot} onChange={(e) => setShowDot(e.target.checked)} className="h-4 w-4 rounded border-rule text-acc focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc" />
        Show dot
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <CategoryPill cat={cat} showDot={showDot} />
        <CategoryDot cat={cat} />
      </div>
    </div>
  )
}

function ProviderIconPreview() {
  const [provider, setProvider] = useState('google')

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {providerOptions.map((option) => (
          <button key={option} type="button" className={controlClass(provider === option)} onClick={() => setProvider(option)}>
            {option}
          </button>
        ))}
      </div>
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-rule bg-card text-tp">
        <SsoProviderIcon provider={provider} />
      </div>
    </div>
  )
}

function ThinkingDotsPreview() {
  return (
    <div className="grid gap-3">
      <p className="text-sm text-ts">Motion-safe loading indicator with visible status text nearby.</p>
      <div className="inline-flex items-center gap-3 rounded-2xl border border-rule bg-card px-4 py-3">
        <ThinkingDots />
        <span className="text-sm font-medium text-tp">Loading component preview</span>
      </div>
    </div>
  )
}

function AppShellPreview() {
  return (
    <div className="grid gap-4 rounded-[1.75rem] border border-rule bg-card p-5">
      <div className="rounded-2xl border border-rule bg-nav px-4 py-3 text-sm text-canvas">
        Skip link, rail, and persistent shell chrome stay consistent across protected surfaces.
      </div>
      <div className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)]">
        <div className="min-h-24 rounded-2xl border border-rule bg-nav/95 p-3 text-xs text-canvas">Rail</div>
        <div className="rounded-2xl border border-rule bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,255,255,0.35))] p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-tc">Main</p>
          <p className="mt-2 text-sm text-tp">This route runs inside the shared app shell.</p>
        </div>
      </div>
    </div>
  )
}

function RailNavPreview() {
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-rule bg-nav p-4 text-canvas">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em]">
          <span>Navigation</span>
          <span>Protected</span>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          <span className="h-8 rounded-xl bg-acc-bg" />
          <span className="h-8 rounded-xl bg-white/5" />
          <span className="h-8 rounded-xl bg-white/5" />
          <span className="h-8 rounded-xl bg-white/5" />
          <span className="h-8 rounded-xl bg-white/5" />
        </div>
      </div>
      <p className="text-sm text-ts">Primary rail navigation with active and inactive states.</p>
    </div>
  )
}

function PagePreview({ entry }) {
  return (
    <div className="grid gap-4 rounded-[1.75rem] border border-rule bg-card p-5">
      <div className="rounded-2xl border border-rule bg-[linear-gradient(135deg,rgba(201,79,42,0.08),rgba(34,95,61,0.06))] p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-tc">{entry.route}</p>
        <h3 className="mt-2 font-serif text-2xl text-tp">{entry.label}</h3>
        <p className="mt-2 text-sm leading-6 text-ts">{entry.note}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Layer</p>
          <p className="mt-2 text-sm font-semibold text-tp">{entry.layer}</p>
        </div>
        <div className="rounded-2xl border border-rule bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Owner</p>
          <p className="mt-2 text-sm font-semibold text-tp">{entry.owner}</p>
        </div>
      </div>
    </div>
  )
}

function ComponentPreview({ entry }) {
  switch (entry.previewKind) {
    case 'app-shell':
      return <AppShellPreview />
    case 'avatar':
      return <AvatarPreview />
    case 'button':
      return <ButtonPreview />
    case 'category':
      return <CategoryPreview />
    case 'code-email':
      return <CodeEmailPreview />
    case 'modal':
      return <ModalPreview />
    case 'page-loader':
      return <PageLoaderPreview />
    case 'provider-icon':
      return <ProviderIconPreview />
    case 'thinking-dots':
      return <ThinkingDotsPreview />
    case 'rail-nav':
      return <RailNavPreview />
    case 'page':
      return <PagePreview entry={entry} />
    default:
      return <GenericPreview entry={entry} />
  }
}

function EntryButton({ entry, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.id)}
      aria-pressed={selected}
      aria-label={entry.label}
      className={cn(
        'w-full rounded-2xl border px-4 py-3 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc motion-safe:hover:-translate-y-0.5',
        selected ? 'border-acc bg-acc-bg shadow-[0_8px_24px_rgba(127,53,31,0.08)]' : 'border-rule bg-card hover:border-rule-em hover:bg-white/65'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-tp">{entry.label}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-tc">{entry.owner}</p>
        </div>
        <span className="rounded-full border border-rule bg-card px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-tc">{entry.layer}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-ts">{entry.note}</p>
      <p className="mt-3 break-words text-[11px] text-tc">{entry.sourcePath}</p>
    </button>
  )
}

export function ComponentLibraryScreen({ entries }) {
  const [query, setQuery] = useState('')
  const [layer, setLayer] = useState('all')
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? '')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const [isPending, startTransition] = useTransition()

  const summary = useMemo(() => {
    const layers = LAYER_ORDER.map((value) => ({
      value,
      count: entries.filter((entry) => entry.layer === value).length,
    }))
    return {
      total: entries.length,
      layers,
      owners: [...new Set(entries.map((entry) => entry.owner))].sort(),
    }
  }, [entries])

  const visibleEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesLayer = layer === 'all' || entry.layer === layer
      const haystack = `${entry.label} ${entry.owner} ${entry.layer} ${entry.note} ${entry.sourcePath}`.toLowerCase()
      return matchesLayer && haystack.includes(deferredQuery)
    })
  }, [deferredQuery, entries, layer])

  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null

  useEffect(() => {
    if (!selectedEntry) return
    if (selectedEntry.id !== selectedId) setSelectedId(selectedEntry.id)
  }, [selectedEntry, selectedId])

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(201,79,42,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,95,61,0.08),transparent_24%)]">
      <header className="border-b border-rule bg-[linear-gradient(180deg,rgba(250,247,243,0.96),rgba(245,240,234,0.84))]">
        <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
          <p className="text-xs uppercase tracking-[0.35em] text-tc">Atomic design registry</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl text-tp sm:text-5xl">Component library</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ts">
                Live inventory for shared primitives, feature compositions, templates, and route-level screens. Use this section to keep new design work consistent before it reaches feature code.
              </p>
            </div>
            <dl className="grid gap-3 rounded-[1.5rem] border border-rule bg-card/90 p-4 shadow-[0_12px_40px_rgba(45,34,26,0.06)] sm:grid-cols-3">
              <MetaRow label="Components" value={summary.total} />
              <MetaRow label="Layers" value={summary.layers.map(({ value, count }) => `${value} ${count}`).join(' · ')} />
              <MetaRow label="Owners" value={summary.owners.join(' · ')} />
            </dl>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[1.75rem] border border-rule bg-card/95 p-4 shadow-[0_12px_32px_rgba(45,34,26,0.05)]">
            <label htmlFor="component-library-search" className="text-sm font-semibold text-tp">Search components</label>
            <input
              id="component-library-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Button, modal, profile..."
              className="mt-2 w-full rounded-2xl border border-rule bg-canvas px-4 py-3 text-sm text-tp placeholder:text-tc focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc"
            />
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by atomic layer">
              <button type="button" onClick={() => startTransition(() => setLayer('all'))} className={controlClass(layer === 'all')}>{layerLabels.all}</button>
              {LAYER_ORDER.map((value) => (
                <button key={value} type="button" onClick={() => startTransition(() => setLayer(value))} className={controlClass(layer === value)}>
                  {layerLabels[value]}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs leading-6 text-tc">
              Showing {visibleEntries.length} of {entries.length} entries{isPending ? ' · updating' : ''}.
            </p>
          </section>

          <section className="rounded-[1.75rem] border border-rule bg-card/95 p-3 shadow-[0_12px_32px_rgba(45,34,26,0.05)]">
            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
              <ul className="space-y-3" role="list">
                {visibleEntries.map((entry) => (
                  <li key={entry.id}>
                    <EntryButton entry={entry} selected={entry.id === selectedEntry?.id} onSelect={(id) => startTransition(() => setSelectedId(id))} />
                  </li>
                ))}
                {!visibleEntries.length && (
                  <li className="rounded-2xl border border-dashed border-rule bg-canvas px-4 py-6 text-sm text-ts">
                    No components match that filter.
                  </li>
                )}
              </ul>
            </div>
          </section>
        </aside>

        <main className="space-y-6">
          {selectedEntry ? (
            <article className="rounded-[2rem] border border-rule bg-[linear-gradient(180deg,rgba(250,247,243,0.94),rgba(245,240,234,0.96))] p-5 shadow-[0_18px_44px_rgba(45,34,26,0.06)] lg:p-7">
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-tc">{selectedEntry.layer}</p>
                  <h2 className="mt-2 font-serif text-3xl text-tp">{selectedEntry.label}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ts">{selectedEntry.note}</p>
                </div>
                <div className="rounded-2xl border border-rule bg-card px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Owner</p>
                  <p className="mt-1 text-sm font-semibold text-tp">{selectedEntry.owner}</p>
                </div>
              </header>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="rounded-[1.75rem] border border-rule bg-card/90 p-5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-tc">Live preview</p>
                  <div className="mt-4">
                    <ComponentPreview entry={selectedEntry} />
                  </div>
                </section>

                <section className="grid gap-3">
                  <MetaRow label="Source path" value={selectedEntry.sourcePath} />
                  <MetaRow label="Atomic layer" value={selectedEntry.layer} />
                  <MetaRow label="Owner" value={selectedEntry.owner} />
                  <MetaRow label="Preview mode" value={selectedEntry.previewKind} />
                  {selectedEntry.route && <MetaRow label="Route" value={selectedEntry.route} />}
                </section>
              </div>
            </article>
          ) : (
            <section className="rounded-[2rem] border border-rule bg-card p-8 text-sm text-ts">
              No component selected.
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
