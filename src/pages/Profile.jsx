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

  // Summary editing
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
      <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* ── Identity panel ── */}
        <div
          className="flex flex-col flex-shrink-0 overflow-y-auto"
          style={{ width: '258px', background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}
        >
          {/* Back link */}
          <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--border)' }}>
            <Link
              to="/dashboard"
              className="no-underline flex items-center gap-1.5 transition-colors"
              style={{ fontSize: '11px', fontWeight: 700, color: 'var(--tx-3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--tx-1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--tx-3)' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <polyline points="10 4 6 8 10 12"/>
              </svg>
              Dashboard
            </Link>
          </div>

          {/* Panel body */}
          <div className="flex flex-col gap-[18px] flex-1" style={{ padding: '20px 18px' }}>

            {/* Avatar + name */}
            <div>
              <div
                className="flex items-center justify-center font-black"
                style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: EMPLOYEE.avBg, color: EMPLOYEE.avCol,
                  fontSize: '18px', marginBottom: '10px',
                }}
              >
                {EMPLOYEE.av}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--tx-1)', letterSpacing: '-0.4px', lineHeight: 1.15 }}>
                {EMPLOYEE.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tx-3)', marginTop: '4px', lineHeight: 1.5 }}>
                {EMPLOYEE.role} · {EMPLOYEE.team}
              </div>
            </div>

            <div className="h-px" style={{ background: 'var(--border)' }} />

            {/* Meta */}
            <div className="flex flex-col gap-3">
              {[
                { label: 'Manager', val: 'A. Diente' },
                { label: 'Entries', val: `${entries.length} total` },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx-1)' }}>{val}</div>
                </div>
              ))}
            </div>

            <div className="h-px" style={{ background: 'var(--border)' }} />

            {/* Pitstop */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '9px' }}>Pitstop</div>
              <div className="flex flex-col gap-1.5">
                {PITSTOP_OPTIONS.map(({ value, label, dot }) => {
                  const isSel = ps === value
                  const selStyles = {
                    g: { background: 'rgba(29,158,117,0.14)', borderColor: 'rgba(29,158,117,0.28)', color: 'var(--teal)' },
                    y: { background: 'rgba(186,117,23,0.16)', borderColor: 'rgba(186,117,23,0.32)', color: 'var(--amber)' },
                    r: { background: 'rgba(226,75,74,0.14)',  borderColor: 'rgba(226,75,74,0.28)',  color: 'var(--red)' },
                  }
                  return (
                    <button
                      key={value}
                      onClick={() => setPs(value)}
                      className="flex items-center gap-2.5 w-full text-left transition-all duration-150"
                      style={{
                        padding: '8px 11px',
                        borderRadius: 'var(--r)',
                        border: '1.5px solid transparent',
                        fontSize: '12px',
                        fontWeight: 700,
                        fontFamily: 'var(--font)',
                        cursor: 'pointer',
                        ...(isSel ? selStyles[value] : { background: 'transparent', color: 'var(--tx-3)' }),
                      }}
                    >
                      <span className="flex-shrink-0" style={{ width: '9px', height: '9px', borderRadius: '3px', background: dot }} />
                      {label}
                    </button>
                  )
                })}
              </div>
              {psSaved && (
                <div className="flex items-center gap-1 mt-2" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--teal)' }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[11px] h-[11px]">
                    <polyline points="3 8 6 11 13 4"/>
                  </svg>
                  Saved
                </div>
              )}
            </div>

            <div className="h-px" style={{ background: 'var(--border)' }} />

            {/* Escalate */}
            {!escalated ? (
              <button
                onClick={() => setEscalateOpen(true)}
                className="flex items-center gap-2 w-full transition-all duration-150"
                style={{
                  padding: '9px 13px',
                  background: 'var(--red-bg)',
                  border: '1.5px solid rgba(240,149,149,0.22)',
                  borderRadius: 'var(--r)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--red)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(240,149,149,0.18)'
                  e.currentTarget.style.borderColor = 'rgba(240,149,149,0.38)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--red-bg)'
                  e.currentTarget.style.borderColor = 'rgba(240,149,149,0.22)'
                }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
                </svg>
                Escalate to HR
              </button>
            ) : (
              <div
                className="flex items-center gap-2"
                style={{ fontSize: '12px', fontWeight: 700, color: 'var(--red)', padding: '9px 13px', background: 'var(--red-bg)', borderRadius: 'var(--r)' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
                </svg>
                Escalated
              </div>
            )}

            <div className="h-px" style={{ background: 'var(--border)' }} />

            {/* Manager summary */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' }}>
                Manager summary
              </div>
              {editingSummary ? (
                <>
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={5}
                    style={{
                      display: 'block',
                      width: '100%',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: 'var(--tx-1)',
                      lineHeight: 1.75,
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1.5px solid var(--border2)',
                      borderRadius: 'var(--r)',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'var(--font)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--acc-text)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border2)' }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleDraftAI}
                      disabled={summaryLoading}
                      className="transition-all duration-150 mr-auto"
                      style={{
                        fontSize: '11px', fontWeight: 700, padding: '5px 12px',
                        background: 'transparent',
                        border: '1.5px solid rgba(239,159,39,0.35)',
                        borderRadius: 'var(--r)',
                        color: 'var(--amber)',
                        cursor: 'pointer', fontFamily: 'var(--font)',
                        opacity: summaryLoading ? 0.5 : 1,
                      }}
                    >
                      {summaryLoading ? 'Drafting…' : 'AI draft'}
                    </button>
                    <button
                      onClick={() => setEditingSummary(false)}
                      style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-3)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSummary}
                      style={{ fontSize: '12px', fontWeight: 700, padding: '6px 14px', background: 'var(--acc)', color: 'var(--tx-1)', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)' }}
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={() => { setDraftText(summaryText); setEditingSummary(true) }}
                    style={{
                      fontSize: '12px', fontStyle: 'italic', color: 'var(--tx-2)',
                      lineHeight: 1.75, cursor: 'text',
                      padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
                      borderRadius: 'var(--r)', border: '1.5px solid transparent',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
                  >
                    {summaryText}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--tx-4)', marginTop: '5px' }}>
                    Click to edit · auto-saves
                  </div>
                  {summarySaved && (
                    <div className="flex items-center gap-1 mt-1" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--teal)' }}>
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
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-doc)', padding: '24px 32px' }}>

          {/* Filter pills + meta */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1.5">
              {[
                { key: null, label: 'All' },
                { key: 'perf', label: 'Performance' },
                { key: 'conduct', label: 'Conduct' },
                { key: 'dev', label: 'Development' },
              ].map(({ key, label }) => {
                const active = filterCat === key
                return (
                  <button
                    key={label}
                    onClick={() => setFilterCat(key)}
                    className="transition-all duration-150"
                    style={{
                      fontSize: '11px', fontWeight: 700, padding: '6px 13px',
                      borderRadius: '20px',
                      border: '1.5px solid',
                      fontFamily: 'var(--font)', cursor: 'pointer',
                      ...(active
                        ? { background: 'var(--acc-bg)', borderColor: 'var(--acc-border)', color: 'var(--acc-text)' }
                        : { background: 'transparent', borderColor: 'var(--border2)', color: 'var(--tx-3)' }
                      ),
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--tx-3)' }}>
              {entries.length} entries
            </span>
          </div>

          {/* Composer trigger */}
          {!composerOpen && (
            <div
              onClick={() => setComposerOpen(true)}
              className="flex items-center gap-2 cursor-pointer transition-colors duration-150"
              style={{
                fontSize: '13px', fontWeight: 600, color: 'var(--tx-3)',
                padding: '14px 0',
                borderTop: '1px dashed var(--border2)',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--acc-text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--tx-3)' }}
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
