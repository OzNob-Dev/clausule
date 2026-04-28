import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@shared/components/ui/Button'
import { Field, FieldCheckbox, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '@shared/components/ui/Field'
import { apiJson, jsonRequest } from '@shared/utils/api'

const CATEGORIES = ['Bug', 'Idea', 'Usability', 'Other']
const FEELINGS = ['Love it', 'Confusing', 'Blocked', 'Just noting']

export default function FeedbackComposer({ userEmail, onClose, onSent }) {
  const [category, setCategory] = useState('Idea')
  const [feeling, setFeeling] = useState('Just noting')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [improvement, setImprovement] = useState('')
  const [contactOk, setContactOk] = useState(true)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const canSend = subject.trim() && message.trim()

  const sendFeedbackMutation = useMutation({
    mutationFn: async () => {
      const data = await apiJson('/api/feedback', jsonRequest({
          category,
          feeling,
          subject: subject.trim(),
          message: message.trim(),
          improvement: improvement.trim(),
          contactOk,
        }, { method: 'POST' }))
      return data.feedback
    },
  })

  const handleSend = async () => {
    if (!canSend) return

    setError('')

    try {
      const savedFeedback = await sendFeedbackMutation.mutateAsync()
      onSent?.(savedFeedback)
      setSent(true)
    } catch {
      setError('Could not send this feedback. Please try again.')
    }
  }

  const sending = sendFeedbackMutation.isPending

  return (
    <div className="be-feedback-stage">
      {sending ? (
        <div className="be-feedback-saving" role="status" aria-live="polite" aria-label="Sending feedback">
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
          <p>Sending feedback to Clausule</p>
        </div>
      ) : sent ? (
        <div className="be-feedback-sent" role="status" aria-live="polite">
          <div className="be-feedback-party" aria-hidden="true">
            <span className="be-feedback-party-burst" />
            <span className="be-feedback-party-spark be-feedback-party-spark--one" />
            <span className="be-feedback-party-spark be-feedback-party-spark--two" />
            <span className="be-feedback-party-spark be-feedback-party-spark--three" />
            <svg className="be-feedback-party-mail" viewBox="0 0 72 72" fill="none">
              <path d="M14 24h44v30H14V24Z" fill="currentColor" opacity="0.12" />
              <path d="M14 24h44v30H14V24Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <path d="m15 26 21 17 21-17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M42 18 54 8l2 15 12 8-16 3-8 13-3-15-14-6 15-8Z" fill="#C94F2A" />
              <path d="M48 16 54 8l1 10 8 6-10 1-5 9-2-10-9-4 11-4Z" fill="#F8D37B" />
            </svg>
          </div>
          <h2>Your feedback has landed.</h2>
          <p>
            Thank you for making Clausule sharper. We sent a tiny paper trail to
            {' '}
            <span className="be-feedback-sent-email">{userEmail || 'your account email'}</span>
            {' '}
            so you know it made it through.
          </p>
          <Button type="button" variant="primary" className="be-comp-save" onClick={onClose}>Back to brag doc</Button>
        </div>
      ) : (
        <>
          <form
            className="be-feedback-form"
            aria-label="Send app feedback"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSend()
            }}
          >
            <div className="be-feedback-head">
              <p className="be-feedback-eyebrow">Product feedback</p>
              <h2>Tell the Clausule team what would make this better.</h2>
            </div>

            <div className="be-feedback-grid">
              <Field>
                <FieldLabel>What is this about?</FieldLabel>
                <FieldSelect value={category} onChange={(e) => setCategory(e.target.value)} autoFocus>
                  {CATEGORIES.map((value) => <option key={value}>{value}</option>)}
                </FieldSelect>
              </Field>
              <Field>
                <FieldLabel>How does it feel?</FieldLabel>
                <FieldSelect value={feeling} onChange={(e) => setFeeling(e.target.value)}>
                  {FEELINGS.map((value) => <option key={value}>{value}</option>)}
                </FieldSelect>
              </Field>
              <Field className="be-feedback-grid-wide">
                <FieldLabel>Short summary</FieldLabel>
                <FieldInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What should we know?" />
              </Field>
            </div>

            <Field className="be-feedback-wide">
              <FieldLabel>Feedback for the app owners</FieldLabel>
              <FieldTextarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell us what happened, what felt good, or what got in your way." />
            </Field>

            <Field className="be-feedback-wide">
              <FieldLabel>What would make it better?</FieldLabel>
              <FieldTextarea value={improvement} onChange={(e) => setImprovement(e.target.value)} rows={3} placeholder="A workflow, design, feature, or rough idea is perfect." />
            </Field>

            <label className="be-feedback-check">
              <FieldCheckbox checked={contactOk} onChange={(e) => setContactOk(e.target.checked)} />
              <span>The Clausule team may contact me about this feedback.</span>
            </label>

            <div className="be-feedback-footer">
              <p>Sent privately to the app owners. This will not appear in your brag doc.</p>
              <div className="be-feedback-actions">
                <Button type="button" variant="ghost" className="be-comp-cancel" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary" className="be-comp-save" disabled={!canSend}>Send feedback</Button>
              </div>
            </div>

            {error && <p className="be-comp-error" role="alert">{error}</p>}
          </form>
        </>
      )}
    </div>
  )
}
