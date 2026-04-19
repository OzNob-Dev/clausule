'use client'

import { useState } from 'react'
import { AppShell } from '@features/manager/components/AppShell'
import { EscalationModal } from '@features/manager/profile/EscalationModal'
import ProfileEntryFeed from '@features/manager/profile/ProfileEntryFeed'
import ProfileSidebar from '@features/manager/profile/ProfileSidebar'
import { usePitstop } from '@features/manager/profile/usePitstop'
import { draftSummary } from '@shared/utils/api'
import { SAMPLE_ENTRIES } from '@shared/data/employees'
import '@features/manager/styles/profile-sidebar.css'
import '@features/manager/styles/profile-content.css'

const EMPLOYEE = {
  name: 'Jordan Ellis',
  role: 'Senior engineer',
  team: 'Platform',
  av: 'JE',
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
  return (
    <AppShell>
      <div className="pf-page">
        <ProfileSidebar
          draftText={draftText}
          editingSummary={editingSummary}
          employee={EMPLOYEE}
          entriesCount={entries.length}
          escalated={escalated}
          onDraftChange={setDraftText}
          onDraftWithAi={handleDraftAI}
          onOpenEscalation={() => setEscalateOpen(true)}
          onSaveSummary={saveSummary}
          onSetEditingSummary={(nextEditing) => {
            if (nextEditing) {
              setDraftText(summaryText)
            }
            setEditingSummary(nextEditing)
          }}
          onSetPitstop={setPs}
          pitstop={ps}
          pitstopSaved={psSaved}
          summaryLoading={summaryLoading}
          summarySaved={summarySaved}
          summaryText={summaryText}
        />

        <ProfileEntryFeed
          composerOpen={composerOpen}
          entries={entries}
          filterCat={filterCat}
          onAddEntry={addEntry}
          onDeleteEntry={deleteEntry}
          onFilterDot={handleFilterDot}
          onSetComposerOpen={setComposerOpen}
          onSetFilterCat={setFilterCat}
        />
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
