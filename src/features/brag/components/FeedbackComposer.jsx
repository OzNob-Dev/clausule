import { useState } from 'react'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function buildFeedbackBody({ context, feedback, impact, source, sourceRole }) {
  return [
    `Feedback from ${source}${sourceRole ? `, ${sourceRole}` : ''}.`,
    context ? `Context: ${context}` : '',
    `Feedback: "${feedback}"`,
    impact ? `Impact: ${impact}` : '',
  ].filter(Boolean).join('\n\n')
}

export default function FeedbackComposer({ onClose, onSave }) {
  const [source, setSource] = useState('')
  const [sourceRole, setSourceRole] = useState('')
  const [date, setDate] = useState(today())
  const [context, setContext] = useState('')
  const [feedback, setFeedback] = useState('')
  const [impact, setImpact] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSave = source.trim() && feedback.trim()

  const handleSave = async () => {
    if (!canSave) return

    setSaving(true)
    setError('')

    try {
      const title = `Feedback from ${source.trim()}`
      const body = buildFeedbackBody({
        context: context.trim(),
        feedback: feedback.trim(),
        impact: impact.trim(),
        source: source.trim(),
        sourceRole: sourceRole.trim(),
      })
      const response = await fetch('/api/brag/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          title,
          body,
          entry_date: date,
          evidence_types: ['Peer recognition'],
          visible_to_manager: true,
        }),
      })

      if (!response.ok) throw new Error('Save failed')
      const { entry } = await response.json()
      onSave({ entry, evidenceTypes: ['Peer recognition'], files: [] })
    } catch {
      setError('Could not save this feedback. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="be-feedback-stage">
      {saving ? (
        <div className="be-feedback-saving" role="status" aria-live="polite" aria-label="Saving feedback">
          <div className="be-feedback-saving-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M12 12h24v18H20l-8 7V12Z" fill="currentColor" opacity="0.14" />
              <path d="M12 12h24v18H20l-8 7V12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M18 19h12M18 24h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p>Turning feedback into brag evidence</p>
        </div>
      ) : (
        <>
          <div className="be-feedback-orbit" aria-hidden="true">
            <span className="be-feedback-orbit-ring" />
            <span className="be-feedback-orbit-bubble" />
            <span className="be-feedback-orbit-bubble" />
            <svg className="be-feedback-orbit-chat" viewBox="0 0 56 56" fill="none">
              <path d="M12 13h32v22H26l-10 8v-8h-4V13Z" fill="currentColor" opacity="0.14" />
              <path d="M12 13h32v22H26l-10 8v-8h-4V13Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M20 22h16M20 28h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="be-feedback-form" role="form" aria-label="Add feedback">
            <div className="be-feedback-head">
              <p className="be-feedback-eyebrow">Peer recognition</p>
              <h2>Capture feedback while it is fresh.</h2>
            </div>

            <div className="be-feedback-grid">
              <label>
                <span>Who gave it?</span>
                <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Manager, peer, customer" autoFocus />
              </label>
              <label>
                <span>Role or team</span>
                <input value={sourceRole} onChange={(e) => setSourceRole(e.target.value)} placeholder="Design lead, Platform team" />
              </label>
              <label>
                <span>Date received</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label>
                <span>Context</span>
                <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="Project, release, workshop" />
              </label>
            </div>

            <label className="be-feedback-wide">
              <span>Feedback</span>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="Paste or write the feedback you received." />
            </label>

            <label className="be-feedback-wide">
              <span>Why it matters</span>
              <textarea value={impact} onChange={(e) => setImpact(e.target.value)} rows={3} placeholder="What did this show about your impact, growth, or strengths?" />
            </label>

            <div className="be-feedback-footer">
              <p>Saved as peer-recognition evidence in your brag doc.</p>
              <div className="be-feedback-actions">
                <button type="button" className="be-comp-cancel" onClick={onClose}>Cancel</button>
                <button type="button" className="be-comp-save" onClick={handleSave} disabled={!canSave}>Save feedback</button>
              </div>
            </div>

            {error && <p className="be-comp-error" role="alert">{error}</p>}
          </div>
        </>
      )}
    </div>
  )
}
