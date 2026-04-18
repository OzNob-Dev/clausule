'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import BragRail from '@/components/brag/BragRail'
import EntryCard from '@/components/brag/EntryCard'
import EntryComposer from '@/components/brag/EntryComposer'
import ResumeTab from '@/components/brag/ResumeTab'
import '@/styles/brag-employee.css'

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
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' })
  const [tab, setTab]                   = useState('brag')
  const [entries, setEntries]           = useState(INITIAL_ENTRIES)
  const [composerOpen, setComposerOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/profile', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() : {})
      .then((d) => setProfile({ firstName: d.firstName ?? '', lastName: d.lastName ?? '', email: d.email ?? '' }))
      .catch(() => {})
  }, [])

  const saveEntry = (entry) => {
    setEntries((prev) => [entry, ...prev])
    setComposerOpen(false)
  }

  return (
    <div className="be-page">
      <BragRail activePage="brag" />

      {/* Identity sidebar */}
      <div className="be-identity be-sidebar" role="complementary" aria-label="Profile and evidence">
        <div className="be-sidebar-header">
          <div className="be-sidebar-eyebrow">Clausule · Brag doc</div>
        </div>
        <div className="be-sidebar-body">
          <div>
            <div className="be-sidebar-avatar" aria-hidden="true">
              {(profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '') || profile.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="be-sidebar-name">
              {profile.firstName || profile.lastName
                ? `${profile.firstName} ${profile.lastName}`.trim()
                : profile.email}
            </div>
            <div className="be-sidebar-role">{profile.email}</div>
          </div>

          <div className="be-divider" role="separator" />

          <div>
            <div className="be-notes-label">Manager note</div>
            <p className="be-note-quote">{MANAGER_NOTE}</p>
          </div>

          <div className="be-divider" role="separator" />

          <div>
            <div className="be-overview-label">Evidence strength</div>
            <div className="be-strength-row">
              <div className="be-sidebar-rings" aria-hidden="true">
                <svg width="50" height="50" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"
                    style={{ stroke: 'var(--ring-outer)' }}
                    strokeDasharray="125.7" strokeDashoffset="31" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
                <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                  <circle cx="25" cy="25" r="13" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="13" fill="none" strokeWidth="4"
                    style={{ stroke: 'var(--ring-mid)' }}
                    strokeDasharray="81.7" strokeDashoffset="20" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
                <svg width="50" height="50" viewBox="0 0 50 50" className="be-sidebar-rings-overlay">
                  <circle cx="25" cy="25" r="6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4"/>
                  <circle cx="25" cy="25" r="6" fill="none" strokeWidth="4"
                    style={{ stroke: 'var(--ring-inner)' }}
                    strokeDasharray="37.7" strokeDashoffset="9" strokeLinecap="round"
                    transform="rotate(-90 25 25)"/>
                </svg>
              </div>
              <div>
                <div className="be-overview-status">Strong</div>
                <div className="be-overview-sub">3 of 4 types</div>
              </div>
            </div>
            <ul className="be-ring-legend" aria-label="Evidence type breakdown">
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: 'var(--ring-outer)' }} aria-hidden="true" />
                Work artefacts ✓
              </li>
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: 'var(--ring-mid)' }} aria-hidden="true" />
                Metrics / data ✓
              </li>
              <li className="be-ring-leg">
                <span className="be-ring-leg-dot" style={{ background: 'var(--ring-inner)' }} aria-hidden="true" />
                Peer recognition ✓
              </li>
              <li className="be-ring-leg be-ring-leg--missing">
                <span className="be-ring-leg-dot be-ring-leg-dot--missing" aria-hidden="true" />
                External links — add one for Exceptional
              </li>
            </ul>
          </div>
        </div>
      </div>

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
