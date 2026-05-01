import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@shared/components/ui/Button'
import { EntryEvidenceFilesNotice, EntryEvidenceTypeGroup, EntryStrengthMeter } from '@shared/components/ui/EntryComposerSections'
import { SectionCard } from '@shared/components/ui/SectionCard'
import { CloseIcon } from '@shared/components/ui/icon/CloseIcon'
import { createEntryAction } from '@actions/brag-actions'

export default function EntryComposer({ onSave = () => {}, onClose = () => {} }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [evTypes, setEvTypes] = useState(new Set())
  const [error, setError] = useState('')

  const saveEntryMutation = useMutation({
    mutationFn: () => createEntryAction({
      title: title.trim(),
      body: body.trim(),
      entry_date: new Date().toISOString().slice(0, 10),
      evidence_types: [...evTypes],
      visible_to_manager: false,
    }),
  })

  const toggleEvType = (type) => {
    setEvTypes((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const handleSave = async () => {
    if (!title.trim()) return

    setError('')

    try {
      const { entry } = await saveEntryMutation.mutateAsync()
      if (!entry) {
        setError('Could not save this entry. Please try again.')
        return
      }
      onSave({ entry, evidenceTypes: [...evTypes] })
    } catch {
      setError('Could not save this entry. Please try again.')
    }
  }

  const saving = saveEntryMutation.isPending

  return (
    <div className="be-entry-composer-stage py-6">
      <SectionCard
        as="form"
        className="be-entry-composer overflow-hidden rounded-[20px] border border-[var(--cl-ink-alpha-12)] bg-[var(--cl-surface-white)] shadow-[0_24px_50px_rgba(26,18,12,0.08)]"
        headerClassName="be-entry-composer-head border-b border-[var(--cl-ink-alpha-12)] bg-[var(--cl-surface-muted-21)] px-7 py-5"
        titleClassName="be-entry-composer-title [font-family:'DM_Serif_Display',Georgia,serif] text-[30px] leading-[1.05] tracking-[-0.02em] text-[var(--cl-surface-ink-2)]"
        bodyClassName="be-entry-composer-body px-7 py-7"
        title="New entry"
        ariaLabel="Add a new entry"
        headerEnd={(
          <Button type="button" variant="ghost" className="be-entry-composer-close rounded-full border border-[var(--cl-ink-alpha-10)] p-2 text-[var(--cl-surface-muted-8)] shadow-none hover:bg-[var(--cl-rule-2)]" onClick={onClose} aria-label="Close form">
            <CloseIcon size={14} />
          </Button>
        )}
        onSubmit={(event) => {
          event.preventDefault()
          void handleSave()
        }}
      >
        <section className="be-entry-field mb-6">
          <label className="be-entry-field-label mb-3 block text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.16em] text-[var(--cl-accent-deep)]" htmlFor="be-entry-title">Entry title</label>
          <input
            id="be-entry-title"
            className="be-entry-title w-full rounded-[14px] border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-4 py-3 text-[var(--cl-text-lg)] font-semibold text-[var(--cl-surface-ink-2)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--cl-surface-muted-8)] hover:border-[var(--cl-accent-soft-11)] focus:border-[var(--cl-accent-deep)] focus:shadow-[0_0_0_3px_var(--cl-accent-soft-13)]"
            type="text"
            placeholder="What did you achieve?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </section>

        <section className="be-entry-field mb-6">
          <label className="be-entry-field-label mb-3 block text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.16em] text-[var(--cl-accent-deep)]" htmlFor="be-entry-body">Impact and evidence</label>
          <textarea
            id="be-entry-body"
            className="be-entry-body min-h-[136px] w-full rounded-[14px] border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-4 py-3 text-[var(--cl-text-base)] leading-[1.65] text-[var(--cl-surface-ink-2)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--cl-surface-muted-8)] hover:border-[var(--cl-accent-soft-11)] focus:border-[var(--cl-accent-deep)] focus:shadow-[0_0_0_3px_var(--cl-accent-soft-13)]"
            rows={5}
            placeholder="Describe what you did, what the impact was, and how you know it worked."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </section>

        <EntryEvidenceTypeGroup selectedTypes={evTypes} onToggle={toggleEvType} />
        <EntryStrengthMeter selectedCount={evTypes.size} />
        <EntryEvidenceFilesNotice />

        <div className="be-entry-form-rule my-6 h-px bg-[var(--cl-ink-alpha-10)]" aria-hidden="true" />

        <div className="form-buttons">
          <Button type="button" variant="ghost" className="be-entry-btn be-entry-btn--secondary rounded-lg border border-[var(--cl-border-2)] px-4 py-2.5 text-[var(--cl-text-sm)] font-bold shadow-none hover:bg-[var(--cl-rule-2)]" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Save entry'}
          </Button>
        </div>

        {error && <p className="be-entry-error" role="alert">{error}</p>}
      </SectionCard>
    </div>
  )
}
