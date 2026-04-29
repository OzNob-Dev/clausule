'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useProfileStore } from '@auth/store/useProfileStore'
import BragEmptyState from '@brag/components/BragEmptyState'
import EntryComposer from '@brag/components/EntryComposer'
import BragDocEntryCard from '@shared/components/ui/BragDocEntryCard'
import BragDocToolbar from '@shared/components/ui/BragDocToolbar'
import '@brag/styles/brag-page.css'
import '@brag/styles/resume-tab.css'
import '@shared/styles/page-loader.css'

const ResumeTab = dynamic(() => import('@brag/components/ResumeTab'), {
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
      <main className="be-main be-doc-screen page-enter" aria-labelledby="brag-page-title">
        <div className="be-inner be-doc-inner">
          <h1 id="brag-page-title" className="sr-only">Brag document</h1>
          {initialEntriesError ? (
            <p className="be-entry-load-error" role="alert">{initialEntriesError}</p>
          ) : (
            <section aria-labelledby="resume-page-title">
              <header className="be-doc-header">
                <span className="be-doc-eyebrow">Your achievements</span>
                <h1 id="resume-page-title" className="be-doc-title">Resume</h1>
              </header>
              <ResumeTab entries={initialEntries} />
            </section>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="be-main be-doc-screen page-enter" aria-labelledby="brag-page-title">
      <div className="be-inner be-doc-inner">
        <h1 id="brag-page-title" className="sr-only">Brag document</h1>

        {initialEntriesError ? (
          <p className="be-entry-load-error" role="alert">{initialEntriesError}</p>
        ) : hasEntries ? (
          <>
            <header className="be-doc-header">
              <span className="be-doc-eyebrow">Your achievements</span>
              <h1 className="be-doc-title">Your entries</h1>
            </header>

            {!composerOpen ? (
              <>
                <BragDocToolbar
                  activeYear={activeYear}
                  entryCount={entryCount}
                  years={years}
                  onAddEntry={() => setComposerOpen(true)}
                  onYearSelect={handleYearSelect}
                />

                <div className="be-doc-timeline">
                  {visibleGroups.map(({ year, groups }) => (
                    <section key={year} id={yearSectionId(year)} className="be-doc-year-group" aria-labelledby={`${yearSectionId(year)}-label`}>
                      <div className="be-doc-year-header">
                        <h2 className="be-doc-year-badge" id={`${yearSectionId(year)}-label`}>{year}</h2>
                        <div className="be-doc-year-line" aria-hidden="true" />
                      </div>

                      {groups.map((group) => (
                        <div key={group.key} className="be-doc-company-group">
                          <header className="be-doc-company-header">
                            <span className="be-doc-company-name">{group.company}</span>
                            <span className="be-doc-company-role">{group.role}</span>
                          </header>

                          <div className="be-doc-entries-list">
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
      </div>
    </main>
  )
}
