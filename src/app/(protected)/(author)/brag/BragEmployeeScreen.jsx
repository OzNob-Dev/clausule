'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useProfileStore } from '@auth/store/useProfileStore'
import BragEmptyState from '@shared/components/BragEmptyState'
import EntryComposer from '@shared/components/EntryComposer'
import BragDocEntryCard from '@shared/components/ui/BragDocEntryCard'
import BragDocToolbar from '@shared/components/ui/BragDocToolbar'
import PageHeader from '@shared/components/ui/PageHeader'
import '@shared/styles/page-loader.css'

const ResumeTab = dynamic(() => import('@shared/components/ResumeTab'), {
  loading: () => <p className="be-entry-load-error" role="status">Loading resume workspace…</p>,
})

function newestEntryFirst(a, b) {
  const dateDiff = new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  if (dateDiff) return dateDiff
  return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
}

function groupEntries(entries, profile) {
  const years = new Map()
  const company = profile.department || 'Team or business unit'
  const role = profile.jobTitle || 'Current role title'

  for (const entry of [...entries].sort(newestEntryFirst)) {
    const year = new Date(entry.entry_date).getFullYear()
    const yearBucket = years.get(year) ?? { year, groups: [] }
    const groupCompany = entry.company?.trim() || company
    const groupRole = entry.role?.trim() || role
    const groupKey = `${groupCompany}::${groupRole}`
    const group = yearBucket.groups.find((item) => item.key === groupKey) ?? { key: groupKey, company: groupCompany, role: groupRole, entries: [] }

    if (!yearBucket.groups.includes(group)) yearBucket.groups.push(group)
    group.entries.push(entry)
    years.set(year, yearBucket)
  }

  return [...years.values()].sort((a, b) => b.year - a.year)
}

function yearSectionId(year) {
  return `be-doc-year-${year}`
}

function visibleEntriesByYear(groupedEntries, activeYear) {
  return activeYear === 'All' ? groupedEntries : groupedEntries.filter(({ year }) => String(year) === String(activeYear))
}


export default function BragEmployeeScreen({ initialEntries = [], initialEntriesError = '', view = 'brag' }) {
  const profile = useProfileStore((state) => state.profile)
  const [composerOpen, setComposerOpen] = useState(false)
  const [activeYear, setActiveYear] = useState('All')
  const yearInitRef = useRef(false)
  const groupedEntries = useMemo(() => groupEntries(initialEntries ?? [], profile), [initialEntries, profile.department, profile.jobTitle])
  const years = useMemo(() => groupedEntries.map(({ year }) => year), [groupedEntries])
  const visibleGroups = useMemo(() => visibleEntriesByYear(groupedEntries, activeYear), [activeYear, groupedEntries])
  const hasEntries = groupedEntries.length > 0
  const entryCount = useMemo(() => visibleGroups.reduce((total, group) => total + group.groups.reduce((sum, item) => sum + item.entries.length, 0), 0), [visibleGroups])

  useEffect(() => {
    setActiveYear((current) => {
      if (!years.length) return 'All'
      if (!yearInitRef.current) {
        yearInitRef.current = true
        return years[0]
      }
      return current === 'All' || years.includes(current) ? current : years[0]
    })
  }, [years])

  const handleYearSelect = (year) => {
    setActiveYear(year)
    if (year !== 'All') document.getElementById(yearSectionId(year))?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  if (view === 'resume') {
    return (
      <>
        <h1 id="brag-page-title" className="sr-only">Brag document</h1>
        {initialEntriesError ? (
          <p className="be-entry-load-error" role="alert">{initialEntriesError}</p>
        ) : (
          <section aria-labelledby="resume-page-title">
            <PageHeader
              className="be-doc-header max-w-[760px] border-b border-[var(--cl-ink-alpha-12)] pb-7"
              eyebrow="Your achievements"
              eyebrowClassName="be-doc-eyebrow mb-3 block text-[var(--cl-text-xs)] font-bold uppercase tracking-[2.5px] text-[var(--cl-accent-deep)]"
              title="Resume"
              titleClassName="be-doc-title [font-family:'DM_Serif_Display',Georgia,serif] text-[44px] leading-none tracking-[-1.5px] text-[var(--cl-surface-ink-2)]"
              titleId="resume-page-title"
            />
            <ResumeTab entries={initialEntries} />
          </section>
        )}
      </>
    )
  }

  return (
    <>
      <h1 id="brag-page-title" className="sr-only">Brag document</h1>

      {initialEntriesError ? (
        <p className="be-entry-load-error" role="alert">{initialEntriesError}</p>
      ) : hasEntries ? (
        <>
          <PageHeader
            className="be-doc-header max-w-[760px] border-b border-[var(--cl-ink-alpha-12)] pb-7"
            eyebrow="Your achievements"
            eyebrowClassName="be-doc-eyebrow mb-3 block text-[var(--cl-text-xs)] font-bold uppercase tracking-[2.5px] text-[var(--cl-accent-deep)]"
            title="Your entries"
            titleClassName="be-doc-title [font-family:'DM_Serif_Display',Georgia,serif] text-[44px] leading-none tracking-[-1.5px] text-[var(--cl-surface-ink-2)]"
          />

          {!composerOpen ? (
            <>
              <BragDocToolbar
                activeYear={activeYear}
                entryCount={entryCount}
                years={years}
                onAddEntry={() => setComposerOpen(true)}
                onYearSelect={handleYearSelect}
              />

              <div className="be-doc-timeline grid gap-0">
                {visibleGroups.map(({ year, groups }) => (
                  <section key={year} id={yearSectionId(year)} className="be-doc-year-group mb-[52px] scroll-mt-6 last:mb-0" aria-labelledby={`${yearSectionId(year)}-label`}>
                    <div className="be-doc-year-header mb-7 flex items-center gap-4">
                      <h2 className="be-doc-year-badge rounded-md bg-[var(--cl-surface-muted-13)] px-3 py-[5px] text-[var(--cl-text-sm)] font-bold leading-[1.4] tracking-[0.8px] text-[var(--cl-surface-ink-2)]" id={`${yearSectionId(year)}-label`}>{year}</h2>
                      <div className="be-doc-year-line h-px flex-1 bg-[var(--cl-ink-alpha-12)]" aria-hidden="true" />
                    </div>

                    {groups.map((group) => (
                      <div key={group.key} className="be-doc-company-group mb-9 last:mb-0">
                        <header className="be-doc-company-header mb-5 flex flex-col gap-1">
                          <span className="be-doc-company-name text-[var(--cl-text-xl)] font-bold text-[var(--cl-surface-ink-2)]">{group.company}</span>
                          <span className="be-doc-company-role text-[var(--cl-text-sm)] uppercase tracking-[0.12em] text-[var(--cl-surface-muted-8)]">{group.role}</span>
                        </header>

                        <div className="be-doc-entries-list grid gap-4">
                          {group.entries.map((entry) => (
                            <BragDocEntryCard key={entry.id} entry={entry} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            </>
          ) : (
            <EntryComposer onSave={() => setComposerOpen(false)} onClose={() => setComposerOpen(false)} />
          )}
        </>
      ) : composerOpen ? (
        <EntryComposer onSave={() => setComposerOpen(false)} onClose={() => setComposerOpen(false)} />
      ) : (
        <BragEmptyState onAddEntry={() => setComposerOpen(true)} />
      )}
    </>
  )
}
