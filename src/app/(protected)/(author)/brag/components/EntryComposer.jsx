import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@shared/components/ui/Button'
import { EntryEvidenceFilesNotice, EntryEvidenceTypeGroup, EntryStrengthMeter } from '@shared/components/ui/EntryComposerSections'
import { SectionCard } from '@shared/components/ui/SectionCard'
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
    <div className="be-entry-composer-stage">
      <SectionCard
        as="form"
        className="be-entry-composer"
        headerClassName="be-entry-composer-head"
        titleClassName="be-entry-composer-title"
        bodyClassName="be-entry-composer-body"
        title="New entry"
        ariaLabel="Add a new entry"
        headerEnd={(
          <Button type="button" variant="ghost" className="be-entry-composer-close" onClick={onClose} aria-label="Close form">
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </Button>
        )}
        onSubmit={(event) => {
          event.preventDefault()
          void handleSave()
        }}
      >
        <section className="be-entry-field">
          <label className="be-entry-field-label" htmlFor="be-entry-title">Entry title</label>
          <input
            id="be-entry-title"
            className="be-entry-title"
            type="text"
            placeholder="What did you achieve?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </section>

        <section className="be-entry-field">
          <label className="be-entry-field-label" htmlFor="be-entry-body">Impact and evidence</label>
          <textarea
            id="be-entry-body"
            className="be-entry-body"
            rows={5}
            placeholder="Describe what you did, what the impact was, and how you know it worked."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </section>

        <EntryEvidenceTypeGroup selectedTypes={evTypes} onToggle={toggleEvType} />
        <EntryStrengthMeter selectedCount={evTypes.size} />
        <EntryEvidenceFilesNotice />

        <div className="be-entry-form-rule" aria-hidden="true" />

        <div className="be-entry-actions">
          <Button type="button" variant="ghost" className="be-entry-btn be-entry-btn--secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Save entry'}
          </Button>
        </div>

        {error && <p className="be-entry-error" role="alert">{error}</p>}
      </SectionCard>
    </div>
  )
}
