'use client'

import { useState } from 'react'
import { useTheme } from '@shared/hooks/useTheme'
import BragRail from '@features/brag/components/BragRail'
import BragSidebar from '@features/brag/components/BragSidebar'
import EntryCard from '@features/brag/components/EntryCard'
import EntryComposer from '@features/brag/components/EntryComposer'
import ResumeTab from '@features/brag/components/ResumeTab'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import '@features/brag/styles/brag-shell.css'
import '@features/brag/styles/brag-page.css'
import '@features/brag/styles/resume-tab.css'

const MANAGER_NOTE =
  'Jordan has had a strong year. The platform migration was the headline — delivered early with consistently positive stakeholder feedback. Genuine tech lead potential here.'

const INITIAL_ENTRIES = [
  {
    id: 1,
    title: 'Presented at guild session — observability tooling',
    date: '2025-11-06',
    body: 'Ran a 45-minute guild session on distributed tracing and observability. Positive attendance — follow-up led to two new team tooling adoptions.',
    strength: 'Exceptional',
    strengthHint: 'Strong across all evidence types',
    ringOffsets: [0, 0, 10],
    pills: [
      { label: 'Slide deck', type: 'filled' },
      { label: '2 adoptions', type: 'gold' },
      { label: 'Attendance data', type: 'gold' },
      { label: 'Peer shoutout', type: 'filled' },
    ],
  },
  {
    id: 2,
    title: 'Led architecture review for Q3 platform migration',
    date: '2025-12-18',
    body: 'Facilitated a cross-team architecture review covering the new event streaming layer. Produced the decision record, got sign-off from 4 teams. Migration ran on schedule with zero rollback events.',
    strength: 'Solid',
    strengthHint: 'Good artefact coverage — add metrics to reach Strong',
    ringOffsets: [0, 19, 37.7],
    pills: [
      { label: 'Decision record', type: 'filled' },
      { label: '4-team sign-off', type: 'filled' },
      { label: '+ add metrics', type: 'empty' },
      { label: '+ peer feedback', type: 'empty' },
    ],
  },
]

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

function cardFromSavedEntry({ entry, evidenceTypes, files }) {
  const pills = evidenceTypes.length
    ? evidenceTypes.slice(0, 4).map(evidenceTypeToPill)
    : files.slice(0, 4).map((file) => ({ label: file.name.replace(/\.[^.]+$/, ''), type: 'filled' }))

  return {
    id: entry.id,
    title: entry.title,
    date: entry.entry_date,
    body: entry.body ?? '',
    strength: entry.strength,
    strengthHint: entry.strength_hint,
    ringOffsets: ringOffsets(evidenceTypes.length),
    pills,
  }
}

export default function BragEmployee() {
  useTheme()
  const profile = useProfileStore((state) => state.profile)
  const [tab, setTab]                   = useState('brag')
  const [entries, setEntries]           = useState(INITIAL_ENTRIES)
  const [composerOpen, setComposerOpen] = useState(false)

  const saveEntry = (savedEntry) => {
    setEntries((prev) => [cardFromSavedEntry(savedEntry), ...prev])
    setComposerOpen(false)
  }

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : profile.email || 'Your profile'

  const avatarInitials =
    ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase() ||
    profile.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <div className="be-page">
      <BragRail activePage="brag" />

      <BragSidebar
        avatarInitials={avatarInitials}
        displayName={displayName}
        email={profile.email}
        managerNote={MANAGER_NOTE}
      />

      <main className="be-main" aria-labelledby="brag-page-title">
        <div className="be-inner">

          <h1 id="brag-page-title" className="sr-only">Brag document</h1>

          <div className="be-tabs" role="tablist" aria-label="Brag document views">
            {[['brag', 'Brag doc'], ['cv', 'Resume']].map(([key, label]) => (
              <button
                key={key}
                id={`tab-${key}`}
                type="button"
                role="tab"
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                onClick={() => setTab(key)}
                className={`be-tab${tab === key ? ' be-tab--active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Brag doc tab */}
          <section id="panel-brag" role="tabpanel" aria-labelledby="tab-brag" hidden={tab !== 'brag'}>
            {!composerOpen ? (
              <button type="button" onClick={() => setComposerOpen(true)} className="be-add-trigger be-add-trigger--top">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <line x1="8" y1="3" x2="8" y2="13"/>
                  <line x1="3" y1="8" x2="13" y2="8"/>
                </svg>
                Add a win
              </button>
            ) : (
              <EntryComposer onSave={saveEntry} onClose={() => setComposerOpen(false)} />
            )}

            <div className="be-sec-label">Your entries</div>

            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </section>

          {/* Resume tab */}
          <section id="panel-cv" role="tabpanel" aria-labelledby="tab-cv" hidden={tab !== 'cv'}>
            <ResumeTab />
          </section>

        </div>
      </main>
    </div>
  )
}
