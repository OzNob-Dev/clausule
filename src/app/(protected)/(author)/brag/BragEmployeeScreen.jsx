'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { useProfileStore } from '@auth/store/useProfileStore'
import BragEmptyState from '@brag/components/BragEmptyState'
import EntryComposer from '@brag/components/EntryComposer'
import '@brag/styles/brag-page.css'
import '@brag/styles/resume-tab.css'
import '@shared/styles/page-loader.css'

const ResumeTab = dynamic(() => import('@brag/components/ResumeTab'), {
  loading: () => <p className="be-entry-load-error" role="status">Loading resume workspace…</p>,
})

function evidenceTypeToPill(type) {
  if (type === 'Metrics / data') return { label: 'Metrics', type: 'gold' }
  if (type === 'Work artefact') return { label: 'Work artefact', type: 'filled' }
  if (type === 'Peer recognition') return { label: 'Peer recognition', type: 'filled' }
  return { label: 'External link', type: 'filled' }
}

function evidenceTypesFromEntry(entry) {
  return (entry.brag_entry_evidence ?? []).map(({ type }) => type).filter(Boolean)
}

function newestEntryFirst(a, b) {
  const dateDiff = new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  if (dateDiff) return dateDiff
  return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
}

function dateLabel(entryDate) {
  const then = new Date(entryDate)
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const diff = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(then.getFullYear(), then.getMonth(), then.getDate())) / dayMs)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(then)
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

function EntryDocCard({ entry }) {
  const evidenceTypes = evidenceTypesFromEntry(entry)
  const pills = evidenceTypes.slice(0, 4).map(evidenceTypeToPill)

  return (
    <article className="be-doc-entry-card">
      <div className="be-doc-entry-head">
        <h4 className="be-doc-entry-title">{entry.title}</h4>
        <div className="be-doc-entry-date">
          <time dateTime={entry.entry_date}>{dateLabel(entry.entry_date)}</time>
        </div>
      </div>
      <p className="be-doc-entry-body">{entry.body ?? ''}</p>
      <div className="be-doc-entry-footer">
        <div className="be-doc-strength-indicator">
          <div className="be-doc-strength-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div className="be-doc-strength-content">
            <div className="be-doc-strength-label">{entry.strength}</div>
            <div className="be-doc-strength-description">{entry.strength_hint}</div>
          </div>
        </div>
        <div className="be-doc-evidence-tags" role="list" aria-label="Evidence">
          {pills.map((pill, i) => (
            <span key={`${pill.label}-${i}`} role="listitem" className={`be-ev-pill be-ev-pill--${pill.type} be-doc-evidence-tag`}>
              <span className="be-ev-pill-dot" aria-hidden="true" />
              {pill.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function BragEmployeeScreen({ initialEntries = [], initialEntriesError = '', view = 'brag' }) {
  const profile = useProfileStore((state) => state.profile)
  const [composerOpen, setComposerOpen] = useState(false)
  const [activeYear, setActiveYear] = useState(null)
  const groupedEntries = useMemo(() => groupEntries(initialEntries ?? [], profile), [initialEntries, profile.department, profile.jobTitle])
  const years = useMemo(() => groupedEntries.map(({ year }) => year), [groupedEntries])
  const hasEntries = groupedEntries.length > 0
  const entryCount = initialEntries?.length ?? 0

  useEffect(() => {
    setActiveYear((current) => (years.includes(current) ? current : years[0] ?? null))
  }, [years])

  const handleYearSelect = (year) => {
    setActiveYear(year)
    document.getElementById(yearSectionId(year))?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
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
                <div className="be-doc-toolbar">
                  <Button type="button" variant="primary" className="be-doc-add-button justify-start" onClick={() => setComposerOpen(true)}>
                    <span className="be-doc-add-icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="8" y1="3" x2="8" y2="13" />
                        <line x1="3" y1="8" x2="13" y2="8" />
                      </svg>
                    </span>
                    <span className="be-doc-add-copy">
                      <span className="be-doc-add-label">Add a win</span>
                      <span className="be-doc-add-description">Capture a fresh entry for your brag doc</span>
                    </span>
                  </Button>

                  {years.length ? (
                    <section className="be-doc-year-nav" aria-label="Year navigation">
                      <span className="be-doc-year-nav-label">Year</span>
                      <div className="be-doc-year-nav-tabs" role="group" aria-label="Choose a year">
                        {years.map((year) => (
                          <button
                            key={year}
                            type="button"
                            className={`be-doc-year-tab${activeYear === year ? ' be-doc-year-tab--active' : ''}`}
                            aria-pressed={activeYear === year}
                            aria-controls={yearSectionId(year)}
                            onClick={() => handleYearSelect(year)}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <div className="be-doc-entry-count" aria-label="Entry count">
                    <strong>{entryCount}</strong>
                    {entryCount === 1 ? 'entry' : 'entries'}
                  </div>
                </div>

                <div className="be-doc-timeline">
                  {groupedEntries.map(({ year, groups }) => (
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
                              <EntryDocCard key={entry.id} entry={entry} />
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
        ) : (
          <BragEmptyState />
        )}
      </div>
    </main>
  )
}
