'use client'

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react'
import { Button } from '@shared/components/ui/Button'
import { FieldInput } from '@shared/components/ui/Field'
import { cn } from '@shared/utils/cn'
import { LAYER_ORDER } from './componentRegistry'
import { ComponentPreview } from './componentPreviews'

const layerLabels = {
  all: 'All',
  atoms: 'Atoms',
  molecules: 'Molecules',
  organisms: 'Organisms',
  templates: 'Templates',
  pages: 'Pages',
}

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

function EntryButton({ entry, selected, onSelect }) {
  return (
    <Button
      type="button"
      onClick={() => onSelect(entry.id)}
      aria-pressed={selected}
      aria-label={entry.exportName}
      className={cn(
        'w-full rounded-2xl border px-4 py-3 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc motion-safe:hover:-translate-y-0.5',
        selected ? 'border-acc bg-acc-bg shadow-[0_8px_24px_rgba(127,53,31,0.08)]' : 'border-rule bg-card hover:border-rule-em hover:bg-white/65'
      )}
      variant="ghost"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-tp">{entry.exportName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-tc">{entry.displayName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-tc">{entry.owner}</p>
        </div>
        <span className="rounded-full border border-rule bg-card px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-tc">{entry.layer}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-ts">{entry.note}</p>
      <p className="mt-3 break-words text-[11px] text-tc">{entry.sourcePath}</p>
    </Button>
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
      const haystack = `${entry.exportName} ${entry.displayName} ${entry.owner} ${entry.layer} ${entry.note} ${entry.sourcePath}`.toLowerCase()
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
            <FieldInput
              id="component-library-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Button, modal, profile..."
              className="mt-2 w-full rounded-2xl border border-rule bg-canvas px-4 py-3 text-sm text-tp placeholder:text-tc focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc"
            />
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by atomic layer">
              <Button type="button" onClick={() => startTransition(() => setLayer('all'))} className={controlClass(layer === 'all')} variant="ghost" size="sm">{layerLabels.all}</Button>
              {LAYER_ORDER.map((value) => (
                <Button key={value} type="button" onClick={() => startTransition(() => setLayer(value))} className={controlClass(layer === value)} variant="ghost" size="sm">
                  {layerLabels[value]}
                </Button>
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
                  <h2 className="mt-2 font-serif text-3xl text-tp">{selectedEntry.exportName}</h2>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-tc">{selectedEntry.displayName}</p>
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
                  <MetaRow label="Export name" value={selectedEntry.exportName} />
                  <MetaRow label="Display name" value={selectedEntry.displayName} />
                  <MetaRow label="Source path" value={selectedEntry.sourcePath} />
                  <MetaRow label="Atomic layer" value={selectedEntry.layer} />
                  <MetaRow label="Owner" value={selectedEntry.owner} />
                  <MetaRow label="Preview mode" value={selectedEntry.previewKind} />
                  <MetaRow label="Exports in file" value={selectedEntry.fileExportCount} />
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
