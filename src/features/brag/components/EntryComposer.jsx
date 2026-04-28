import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@shared/components/ui/Button'
import { Field, FieldInput, FieldLabel, FieldTextarea } from '@shared/components/ui/Field'
import { apiJson, jsonRequest } from '@shared/utils/api'
import { EvidenceTypeGroup, EvidenceUploadNotice } from './EntryComposerParts'

export default function EntryComposer({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [evTypes, setEvTypes] = useState(new Set())
  const [error, setError] = useState('')

  const saveEntryMutation = useMutation({
    mutationFn: () =>
      apiJson('/api/brag/entries', jsonRequest({
        title: title.trim(),
        body: body.trim(),
        entry_date: new Date().toISOString().slice(0, 10),
        evidence_types: [...evTypes],
        visible_to_manager: false,
      }, { method: 'POST' })),
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
      <form
        className="be-entry-composer"
        aria-label="Add a new entry"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSave()
        }}
      >
        <section className="be-entry-section">
          <Field>
            <FieldLabel htmlFor="be-entry-title">Entry title</FieldLabel>
            <FieldInput
              id="be-entry-title"
              className="be-entry-title"
              type="text"
              placeholder="What did you achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </Field>
        </section>

        <div className="be-entry-divider" aria-hidden="true" />

        <section className="be-entry-section">
          <Field>
            <FieldLabel htmlFor="be-entry-body">Impact and evidence</FieldLabel>
            <FieldTextarea
              id="be-entry-body"
              className="be-entry-body"
              rows={4}
              placeholder="Describe what you did, what the impact was, and how you know it worked."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
        </section>

        <EvidenceTypeGroup selectedTypes={evTypes} onToggle={toggleEvType} />
        <EvidenceUploadNotice />

        <div className="be-entry-actions">
          <Button type="button" variant="ghost" className="be-entry-btn be-entry-btn--secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="primary" className="be-entry-btn be-entry-btn--primary" disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Save entry'}
          </Button>
        </div>

        {error && <p className="be-entry-error" role="alert">{error}</p>}
      </form>
    </div>
  )
}
