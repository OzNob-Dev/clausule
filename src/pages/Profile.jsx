import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { Avatar } from '../components/ui/Avatar'
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
  avBg: 'rgba(239,159,39,0.14)',
  avCol: '#EF9F27',
}

const INITIAL_SUMMARY = 'Jordan has been a consistent performer this quarter, demonstrating technical initiative on the authentication refactor and meaningful growth in code review quality. One interpersonal concern was raised and addressed promptly. Overall trajectory is positive.'

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

  const handleFilterDot = (cat) => {
    setFilterCat((prev) => (prev === cat ? null : cat))
  }

  const addEntry = (entry) => setEntries((prev) => [entry, ...prev])
  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id))

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar initials={EMPLOYEE.av} bg={EMPLOYEE.avBg} color={EMPLOYEE.avCol} size="lg" />
            <div>
              <h1 className="text-[20px] font-black text-tp">{EMPLOYEE.name}</h1>
              <p className="text-[13px] text-tm mt-0.5">{EMPLOYEE.role} · {EMPLOYEE.team}</p>
            </div>
          </div>
          {!escalated ? (
            <button
              id="escalateTrigger"
              onClick={() => setEscalateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-rt rounded-clausule hover:bg-rb transition-colors"
              style={{ border: '1px solid var(--rb)' }}
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
              </svg>
              Escalate to HR
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-rt bg-rb rounded-clausule">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z"/>
              </svg>
              Escalated to HR
            </span>
          )}
        </div>

        {/* Pitstop */}
        <div
          className="rounded-clausule p-4 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-ts uppercase tracking-[0.4px]">Status</span>
          </div>
          <div className="mt-3">
            <PitstopSelector value={ps} onSelect={setPs} saved={psSaved} />
          </div>
        </div>

        {/* Manager summary */}
        <div
          className="rounded-clausule p-4 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-ts uppercase tracking-[0.4px]">Manager summary</span>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] text-tm transition-opacity duration-300 ${summarySaved ? 'opacity-100' : 'opacity-0'}`}>
                Saved
              </span>
              {!editingSummary ? (
                <>
                  <button
                    onClick={() => { setDraftText(summaryText); setEditingSummary(true) }}
                    className="text-[12px] text-bl hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDraftAI}
                    disabled={summaryLoading}
                    className="text-[12px] hover:underline disabled:opacity-50"
                    style={{ color: 'var(--acc-text)' }}
                  >
                    {summaryLoading ? 'Drafting…' : 'AI draft'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={saveSummary} className="text-[12px] font-bold hover:opacity-80" style={{ color: 'var(--gt)' }}>Save</button>
                  <button onClick={() => setEditingSummary(false)} className="text-[12px] text-tm hover:text-ts">Cancel</button>
                </>
              )}
            </div>
          </div>
          {editingSummary ? (
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={4}
              className="w-full text-[14px] text-ts leading-relaxed bg-transparent rounded-clausule p-2.5 resize-none outline-none focus:border-bl"
              style={{ border: '1px solid var(--rule)', background: 'rgba(255,255,255,0.04)' }}
            />
          ) : (
            <p className="text-[14px] text-ts leading-relaxed">{summaryText}</p>
          )}
        </div>

        {/* Entries */}
        <div
          className="rounded-clausule p-4"
          style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-ts uppercase tracking-[0.4px]">
              File notes · {entries.length}
            </span>
            {filterCat && (
              <button onClick={() => setFilterCat(null)} className="text-[11px] text-bl hover:underline">
                Clear filter
              </button>
            )}
          </div>

          {/* Composer trigger */}
          {!composerOpen && (
            <button
              onClick={() => setComposerOpen(true)}
              className="w-full text-left px-3 py-2.5 text-[13px] text-tm rounded-clausule hover:text-ts transition-colors mb-4"
              style={{ border: '1px dashed var(--rule-em)' }}
            >
              + Add a note…
            </button>
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

      {/* Escalation modal */}
      <EscalationModal
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        onConfirm={() => setEscalated(true)}
        context={`${EMPLOYEE.name} · ${EMPLOYEE.role}`}
      />
    </AppShell>
  )
}
