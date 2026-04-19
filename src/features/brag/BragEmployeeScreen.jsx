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

export default function BragEmployee() {
  useTheme()
  const profile = useProfileStore((state) => state.profile)
  const [tab, setTab]                   = useState('brag')
  const [entries, setEntries]           = useState(INITIAL_ENTRIES)
  const [composerOpen, setComposerOpen] = useState(false)

  const saveEntry = (entry) => {
    setEntries((prev) => [entry, ...prev])
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

      {/* Main content */}
      <main className="be-main">
        <div className="be-inner">

          <div className="be-tabs" role="tablist">
            {[['brag', 'Brag doc'], ['cv', 'Resume']].map(([key, label]) => (
              <button
                key={key}
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
          <div id="panel-brag" role="tabpanel" aria-labelledby="tab-brag" hidden={tab !== 'brag'}>
            <div className="be-card">
              <div className="be-card-label">
                From your manager
                <div className="be-card-rule" aria-hidden="true" />
                <span className="be-read-only-badge">Read only</span>
              </div>
              <p className="be-summary-quote">{MANAGER_NOTE}</p>
            </div>

            <div className="be-sec-label">Your entries</div>

            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}

            {!composerOpen ? (
              <button onClick={() => setComposerOpen(true)} className="be-add-trigger">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <line x1="8" y1="3" x2="8" y2="13"/>
                  <line x1="3" y1="8" x2="13" y2="8"/>
                </svg>
                Add a win
              </button>
            ) : (
              <EntryComposer onSave={saveEntry} onClose={() => setComposerOpen(false)} />
            )}
          </div>

          {/* Resume tab */}
          <div id="panel-cv" role="tabpanel" aria-labelledby="tab-cv" hidden={tab !== 'cv'}>
            <ResumeTab />
          </div>

        </div>
      </main>
    </div>
  )
}
