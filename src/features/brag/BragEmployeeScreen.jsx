'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useTransition } from 'react'
import { useTheme } from '@shared/hooks/useTheme'
import BragRail from '@features/brag/components/BragRail'
import BragIdentitySidebar from '@features/brag/components/BragIdentitySidebar'
import BragEmptyState from '@features/brag/components/BragEmptyState'
import EntryCard from '@features/brag/components/EntryCard'
import EntryComposer from '@features/brag/components/EntryComposer'
import Link from 'next/link'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { profileDisplayName, profileInitials } from '@shared/utils/profile'
import { ROUTES } from '@shared/utils/routes'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-page.css'
import '@features/brag/styles/resume-tab.css'

const ResumeTab = dynamic(() => import('@features/brag/components/ResumeTab'), {
  loading: () => <p className="be-entry-load-error" role="status">Loading resume workspace…</p>,
})

function evidenceTypeToPill(type) {
  if (type === 'Metrics / data') return { label: 'Metrics', type: 'gold' }
  if (type === 'Work artefact') return { label: 'Work artefact', type: 'filled' }
  if (type === 'Peer recognition') return { label: 'Peer recognition', type: 'filled' }
  return { label: 'External link', type: 'filled' }
}

function ringOffsets(count) {
  return [
    count >= 1 ? 0 : 113.1,
    count >= 2 ? 0 : 75.4,
    count >= 3 ? 0 : 37.7,
  ]
}

function cardFromSavedEntry({ entry, evidenceTypes }) {
  return {
    id: entry.id,
    title: entry.title,
    date: entry.entry_date,
    body: entry.body ?? '',
    strength: entry.strength,
    strengthHint: entry.strength_hint,
    ringOffsets: ringOffsets(evidenceTypes.length),
    pills: evidenceTypes.slice(0, 4).map(evidenceTypeToPill),
  }
}

function evidenceTypesFromEntry(entry) {
  return (entry.brag_entry_evidence ?? []).map(({ type }) => type).filter(Boolean)
}

function cardFromEntry(entry) {
  const evidenceTypes = evidenceTypesFromEntry(entry)

  return {
    id: entry.id,
    title: entry.title,
    date: entry.entry_date,
    body: entry.body ?? '',
    strength: entry.strength,
    strengthHint: entry.strength_hint,
    ringOffsets: ringOffsets(evidenceTypes.length),
    pills: evidenceTypes.slice(0, 4).map(evidenceTypeToPill),
  }
}

function newestEntryFirst(a, b) {
  const dateDiff = new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  if (dateDiff) return dateDiff
  return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
}

export function mapEntryToCard(entry) {
  return cardFromEntry(entry)
}

export default function BragEmployee({ initialEntries = [], initialEntriesError = '' }) {
  useTheme()
  const profile = useProfileStore((state) => state.profile)
  const [, startPanelTransition] = useTransition()
  const tabOrder = ['brag', 'cv']
  const [tab, setTab]                   = useState('brag')
  const [entries, setEntries]           = useState(() => [...(initialEntries ?? [])].sort(newestEntryFirst).map(cardFromEntry))
  const entriesError                    = initialEntriesError
  const [composerOpen, setComposerOpen] = useState(false)
  const panelKey = composerOpen ? 'composer' : entriesError ? 'error' : entries.length ? 'entries' : 'empty'
  const [visiblePanel, setVisiblePanel] = useState(panelKey)
  const [panelExiting, setPanelExiting] = useState(false)

  useEffect(() => {
    if (panelKey === visiblePanel) return undefined

    setPanelExiting(true)
    const timeout = setTimeout(() => {
      setVisiblePanel(panelKey)
      setPanelExiting(false)
    }, 180)

    return () => clearTimeout(timeout)
  }, [panelKey, visiblePanel])

  const saveEntry = (savedEntry) => {
    startPanelTransition(() => {
      setEntries((prev) => [cardFromSavedEntry(savedEntry), ...prev])
      setComposerOpen(false)
    })
  }

  const displayName    = profileDisplayName(profile)
  const avatarInitials = profileInitials(profile)

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

  const panelContent = {
    composer: <EntryComposer onSave={saveEntry} onClose={() => setComposerOpen(false)} />,
    error: <p className="be-entry-load-error" role="alert">{entriesError}</p>,
    empty: <BragEmptyState onAddEntry={() => startPanelTransition(() => setComposerOpen(true))} />,
    entries: (
      <>
        <div className="be-sec-label">Your entries</div>
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </>
    ),
  }

  return (
    <div className="be-page">
      <BragRail activePage="brag" />

      <BragIdentitySidebar
        avatarInitials={avatarInitials}
        displayName={displayName}
        email={profile.email}
      />

      <main className="be-main" aria-labelledby="brag-page-title">
        <div className="be-inner">

          <h1 id="brag-page-title" className="sr-only">Brag document</h1>

          {entries.length > 0 && (
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
          )}

          {/* Brag doc tab */}
          <section id="panel-brag" role="tabpanel" aria-labelledby="tab-brag" hidden={tab !== 'brag'}>
            {!composerOpen && entries.length > 0 ? (
              <div className="be-action-row" aria-label="Brag actions">
                <button type="button" onClick={() => startPanelTransition(() => setComposerOpen(true))} className="be-add-trigger be-add-trigger--top">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <line x1="8" y1="3" x2="8" y2="13"/>
                    <line x1="3" y1="8" x2="13" y2="8"/>
                  </svg>
                  Add a win
                </button>
                <Link href={ROUTES.bragFeedback} className="be-add-trigger be-add-trigger--top">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M3 3h10v7H7l-4 3V3Z" />
                    <path d="M6 6h4M6 8h3" />
                  </svg>
                  Add feedback
                </Link>
              </div>
            ) : null}

            <div className={`be-panel-swap${panelExiting ? ' be-panel-swap--out' : ' be-panel-swap--in'}`} key={visiblePanel}>
              {panelContent[visiblePanel]}
            </div>
          </section>

          {entries.length > 0 && (
            <section id="panel-cv" role="tabpanel" aria-labelledby="tab-cv" hidden={tab !== 'cv'}>
              <ResumeTab entries={entries} />
            </section>
          )}

        </div>
      </main>
    </div>
  )
}
