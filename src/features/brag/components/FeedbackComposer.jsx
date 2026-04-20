import { useState } from 'react'

const CATEGORIES = ['Bug', 'Idea', 'Usability', 'Other']
const FEELINGS = ['Love it', 'Confusing', 'Blocked', 'Just noting']

export default function FeedbackComposer({ onClose }) {
  const [category, setCategory] = useState('Idea')
  const [feeling, setFeeling] = useState('Just noting')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [improvement, setImprovement] = useState('')
  const [contactOk, setContactOk] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const canSend = subject.trim() && message.trim()

  const handleSend = async () => {
    if (!canSend) return

    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          category,
          feeling,
          subject: subject.trim(),
          message: message.trim(),
          improvement: improvement.trim(),
          contactOk,
        }),
      })

      if (!response.ok) throw new Error('Send failed')
      setSent(true)
    } catch {
      setError('Could not send this feedback. Please try again.')
    } finally {
      setSending(false)
    }
  }

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
          <div className="be-feedback-orbit" aria-hidden="true">
            <span className="be-feedback-orbit-ring" />
            <svg className="be-feedback-orbit-chat" viewBox="0 0 56 56" fill="none">
              <path d="M17 29 25 37 41 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Feedback sent.</h2>
          <p>Thank you for helping shape Clausule.</p>
          <button type="button" className="be-comp-save" onClick={onClose}>Back to brag doc</button>
        </div>
      ) : (
        <>
          <div className="be-feedback-form" role="form" aria-label="Send app feedback">
            <div className="be-feedback-head">
              <p className="be-feedback-eyebrow">Product feedback</p>
              <h2>Tell the Clausule team what would make this better.</h2>
            </div>

            <div className="be-feedback-grid">
              <label>
                <span>What is this about?</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} autoFocus>
                  {CATEGORIES.map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>
                <span>How does it feel?</span>
                <select value={feeling} onChange={(e) => setFeeling(e.target.value)}>
                  {FEELINGS.map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label className="be-feedback-grid-wide">
                <span>Short summary</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What should we know?" />
              </label>
            </div>

            <label className="be-feedback-wide">
              <span>Feedback for the app owners</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell us what happened, what felt good, or what got in your way." />
            </label>

            <label className="be-feedback-wide">
              <span>What would make it better?</span>
              <textarea value={improvement} onChange={(e) => setImprovement(e.target.value)} rows={3} placeholder="A workflow, design, feature, or rough idea is perfect." />
            </label>

            <label className="be-feedback-check">
              <input type="checkbox" checked={contactOk} onChange={(e) => setContactOk(e.target.checked)} />
              <span>The Clausule team may contact me about this feedback.</span>
            </label>

            <div className="be-feedback-footer">
              <p>Sent privately to the app owners. This will not appear in your brag doc.</p>
              <div className="be-feedback-actions">
                <button type="button" className="be-comp-cancel" onClick={onClose}>Cancel</button>
                <button type="button" className="be-comp-save" onClick={handleSend} disabled={!canSend}>Send feedback</button>
              </div>
            </div>

            {error && <p className="be-comp-error" role="alert">{error}</p>}
          </div>
        </>
      )}
    </div>
  )
}
