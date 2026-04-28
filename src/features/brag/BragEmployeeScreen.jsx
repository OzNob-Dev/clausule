'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState, useTransition } from 'react'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import BragEmptyState from '@features/brag/components/BragEmptyState'
import EntryComposer from '@features/brag/components/EntryComposer'
import '@features/brag/styles/brag-page.css'
import '@features/brag/styles/resume-tab.css'
import '@shared/styles/page-loader.css'

const ResumeTab = dynamic(() => import('@features/brag/components/ResumeTab'), {
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

export default function BragEmployeeScreen({ initialEntries = [], initialEntriesError = '' }) {
  const profile = useProfileStore((state) => state.profile)
  const [, startPanelTransition] = useTransition()
  const [tab, setTab] = useState('brag')
  const [composerOpen, setComposerOpen] = useState(false)
  const groupedEntries = useMemo(() => groupEntries(initialEntries ?? [], profile), [initialEntries, profile.department, profile.jobTitle])
  const tabOrder = ['brag', 'cv']
  const hasEntries = groupedEntries.length > 0

  const moveTab = (direction) => {
    const currentIndex = tabOrder.indexOf(tab)
    const nextIndex = direction === 'start'
      ? 0
      : direction === 'end'
        ? tabOrder.length - 1
        : (currentIndex + direction + tabOrder.length) % tabOrder.length
    const nextTab = tabOrder[nextIndex]
    startPanelTransition(() => setTab(nextTab))
    document.getElementById(`tab-${nextTab}`)?.focus()
  }

  const handleTabKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveTab(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveTab(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      moveTab('start')
    } else if (event.key === 'End') {
      event.preventDefault()
      moveTab('end')
    }
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

            <div className="be-doc-tabs-row">
              <div className="be-tabs" role="tablist" aria-label="Brag document views">
                {[['brag', 'Brag doc'], ['cv', 'Resume']].map(([key, label]) => (
                  <button
                    key={key}
                    id={`tab-${key}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    aria-controls={`panel-${key}`}
                    tabIndex={tab === key ? 0 : -1}
                    onClick={() => startPanelTransition(() => setTab(key))}
                    onKeyDown={handleTabKeyDown}
                    className={`be-tab${tab === key ? ' be-tab--active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <section
              id="panel-brag"
              role="tabpanel"
              aria-labelledby="tab-brag"
              hidden={tab !== 'brag'}
            >
              {!composerOpen ? (
                <>
                  <div className="be-doc-cta-wrap">
                    <button type="button" className="be-doc-add-button" onClick={() => setComposerOpen(true)}>
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
                    </button>
                  </div>

                  <div className="be-doc-timeline">
                    {groupedEntries.map(({ year, groups }) => (
                      <section key={year} className="be-doc-year-group" aria-labelledby={`be-doc-year-${year}`}>
                        <div className="be-doc-year-header">
                          <h2 className="be-doc-year-badge" id={`be-doc-year-${year}`}>{year}</h2>
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
            </section>

            <section id="panel-cv" role="tabpanel" aria-labelledby="tab-cv" hidden={tab !== 'cv'}>
              <ResumeTab entries={initialEntries} />
            </section>

            <footer className="be-doc-pagination" aria-label="Brag pagination">
              <button type="button" className="be-doc-pagination-btn" aria-label="Previous year" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="be-doc-pagination-info">
                <span className="be-doc-pagination-text">
                  {groupedEntries.length ? `${Math.min(...groupedEntries.map(({ year }) => year))} – ${Math.max(...groupedEntries.map(({ year }) => year))}` : '—'}
                </span>
                <div className="be-doc-pagination-divider" aria-hidden="true" />
                <span className="be-doc-pagination-text">{initialEntries.length} entries</span>
              </div>
              <div className="be-doc-pagination-dots" aria-hidden="true">
                {groupedEntries.map((_, i) => (
                  <span key={i} className={`be-doc-pagination-dot${i === 0 ? ' is-active' : ''}`} />
                ))}
              </div>
              <button type="button" className="be-doc-pagination-btn" aria-label="Next year">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </footer>
          </>
        ) : (
          <BragEmptyState onAddEntry={() => {}} />
        )}
      </div>
    </main>
  )
}
