import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { PitstopSelector } from '../components/profile/PitstopSelector'
import { EscalationModal } from '../components/profile/EscalationModal'
import { EntryCard } from '../components/entries/EntryCard'
import { EntryComposer } from '../components/entries/EntryComposer'
import { usePitstop } from '../hooks/usePitstop'
import { draftSummary } from '../utils/api'
import { SAMPLE_ENTRIES } from '../data/employees'
import '../styles/profile.css'

const EMPLOYEE = {
  name: 'Jordan Ellis',
  role: 'Senior engineer',
  team: 'Platform',
  av: 'JE',
  avBg: 'rgba(208,90,52,0.18)',
  avCol: '#F5A070',
}

const INITIAL_SUMMARY = 'Jordan is a strong senior engineer with genuine potential for a tech lead role. Delivery is consistently reliable — the platform migration was a standout. Overall trajectory is positive.'

export default function Profile() {
  const { value: ps, select: setPs, saved: psSaved } = usePitstop('/profile')
  const [entries, setEntries] = useState(SAMPLE_ENTRIES)
  const [composerOpen, setComposerOpen] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [filterCat, setFilterCat] = useState(null)

  const [summaryText, setSummaryText] = useState(INITIAL_SUMMARY)
  const [editingSummary, setEditingSummary] = useState(false)
  const [draftText, setDraftText] = useState(INITIAL_SUMMARY)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summarySaved, setSummarySaved] = useState(false)

  const saveSummary = () => {
    setSummaryText(draftText)
    setEditingSummary(false)
    setSummarySaved(true)
    setTimeout(() => setSummarySaved(false), 2200)
  }

  const handleDraftAI = async () => {
    setSummaryLoading(true)
    try {
      const text = await draftSummary(EMPLOYEE.name, entries)
      setDraftText(text)
    } catch {
      setDraftText('Unable to generate draft — check your API key in .env.')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleFilterDot = (cat) => setFilterCat((prev) => (prev === cat ? null : cat))
  const addEntry = (entry) => setEntries((prev) => [entry, ...prev])
  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id))

  const PITSTOP_OPTIONS = [
    { value: 'g', label: 'Going well',    dot: '#1D9E75' },
    { value: 'y', label: 'Working on it', dot: '#BA7517' },
    { value: 'r', label: 'Needs work',    dot: '#E24B4A' },
  ]

  return (
    <AppShell>
      <div className="pf-page">

        {/* ── Identity panel ── */}
        <div className="pf-panel">
          {/* Back link */}
          <div className="pf-back-row">
            <Link to="/dashboard" className="pf-back-link">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <polyline points="10 4 6 8 10 12"/>
              </svg>
              Dashboard
            </Link>
          </div>

          {/* Panel body */}
          <div className="pf-body">

            {/* Avatar + name */}
            <div>
              <div
                className="pf-avatar"
                style={{ background: EMPLOYEE.avBg, color: EMPLOYEE.avCol }}
              >
                {EMPLOYEE.av}
              </div>
              <div className="pf-name">{EMPLOYEE.name}</div>
              <div className="pf-role">{EMPLOYEE.role} · {EMPLOYEE.team}</div>
            </div>

            <div className="pf-divider" />

            {/* Meta */}
            <div className="flex flex-col gap-3">
              {[
                { label: 'Manager', val: 'A. Diente' },
                { label: 'Entries', val: `${entries.length} total` },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div className="pf-section-label">{label}</div>
                  <div className="pf-meta-val">{val}</div>
                </div>
              ))}
            </div>

            <div className="pf-divider" />

            {/* Pitstop */}
            <div>
              <div className="pf-pitstop-label">Pitstop</div>
              <div className="flex flex-col gap-1.5">
                {PITSTOP_OPTIONS.map(({ value, label, dot }) => {
                  const isSel = ps === value
                  return (
                    <button
                      key={value}
                      onClick={() => setPs(value)}
                      className={`pf-pitstop-btn pf-pitstop-btn--${value}${isSel ? ' pf-pitstop-btn--sel' : ''}`}
                    >
                      <span className="pf-pitstop-dot" style={{ background: dot }} />
                      {label}
                    </button>
                  )
                })}
              </div>
              {psSaved && (
                <div className="pf-saved">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[11px] h-[11px]">
                    <polyline points="3 8 6 11 13 4"/>
                  </svg>
                  Saved
                </div>
              )}
            </div>

            <div className="pf-divider" />

            {/* Escalate */}
            {!escalated ? (
              <button onClick={() => setEscalateOpen(true)} className="pf-escalate-btn">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
                </svg>
                Escalate to HR
              </button>
            ) : (
              <div className="pf-escalated-indicator">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
                </svg>
                Escalated
              </div>
            )}

            <div className="pf-divider" />

            {/* Manager summary */}
            <div>
              <div className="pf-summary-label">Manager summary</div>
              {editingSummary ? (
                <>
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={5}
                    className="pf-summary-textarea"
                  />
                  <div className="pf-summary-actions">
                    <button
                      onClick={handleDraftAI}
                      disabled={summaryLoading}
                      className="pf-btn-ai-draft"
                    >
                      {summaryLoading ? 'Drafting…' : 'AI draft'}
                    </button>
                    <button onClick={() => setEditingSummary(false)} className="pf-btn-summary-cancel">
                      Cancel
                    </button>
                    <button onClick={saveSummary} className="pf-btn-summary-save">
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={() => { setDraftText(summaryText); setEditingSummary(true) }}
                    className="pf-summary-view"
                  >
                    {summaryText}
                  </div>
                  <div className="pf-summary-hint">Click to edit · auto-saves</div>
                  {summarySaved && (
                    <div className="pf-auto-saved">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[11px] h-[11px]">
                        <polyline points="3 8 6 11 13 4"/>
                      </svg>
                      Auto-saved
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Document content area ── */}
        <div className="pf-doc">

          {/* Filter pills + meta */}
          <div className="pf-filter-row">
            <div className="pf-filter-pills">
              {[
                { key: null, label: 'All' },
                { key: 'perf', label: 'Performance' },
                { key: 'conduct', label: 'Conduct' },
                { key: 'dev', label: 'Development' },
              ].map(({ key, label }) => (
                <button
                  key={label}
                  onClick={() => setFilterCat(key)}
                  className={`pf-filter-btn${filterCat === key ? ' pf-filter-btn--active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="pf-entry-count">{entries.length} entries</span>
          </div>

          {/* Composer trigger */}
          {!composerOpen && (
            <div
              onClick={() => setComposerOpen(true)}
              className="pf-composer-trigger"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
              </svg>
              Add entry
            </div>
          )}

          {composerOpen && (
            <EntryComposer onSave={addEntry} onClose={() => setComposerOpen(false)} />
          )}

          {/* Entry list */}
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={deleteEntry}
              filterActive={handleFilterDot}
              isFiltered={filterCat !== null && filterCat !== entry.cat}
            />
          ))}
        </div>
      </div>

      <EscalationModal
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        onConfirm={() => setEscalated(true)}
        context={`${EMPLOYEE.name} · ${EMPLOYEE.role}`}
      />
    </AppShell>
  )
}
