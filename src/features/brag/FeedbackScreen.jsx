'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { fieldClass, areaClass } from '@shared/constants/classNames'
import { useProfileStore } from '@features/auth/store/useProfileStore'
import { ROUTES } from '@shared/utils/routes'
import { apiJson, jsonRequest } from '@shared/utils/api'
import '@features/brag/styles/brag-page.css'
import '@shared/styles/page-loader.css'

const CATEGORIES = ['Idea', 'Bug', 'Feature Request', 'General Feedback']
const FEELINGS = ['Just noting', 'Minor annoyance', 'Frustrating', 'Blocking work']

export default function FeedbackScreen() {
  const router = useRouter()
  const userEmail = useProfileStore((state) => state.profile.email)
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
    mutationFn: async () =>
      apiJson(
        '/api/feedback',
        jsonRequest(
          {
            category,
            feeling,
            subject: subject.trim(),
            message: message.trim(),
            improvement: improvement.trim(),
            contactOk,
          },
          { method: 'POST' }
        )
      ),
  })

  const handleSend = async () => {
    if (!canSend) return
    setError('')

    try {
      await sendFeedbackMutation.mutateAsync()
      setSent(true)
    } catch {
      setError('Could not send this feedback. Please try again.')
    }
  }

  return (
    <main className="be-main page-enter" aria-labelledby="feedback-page-title">
      <div className="be-inner be-feedback-screen">
        <header className="be-feedback-hero">
          <p className="be-feedback-eyebrow">Product feedback</p>
          <h1 id="feedback-page-title">Tell the Clausule team what would make this better.</h1>
        </header>

        {sendFeedbackMutation.isPending ? (
          <div className="be-feedback-card be-feedback-state" role="status" aria-live="polite" aria-label="Sending feedback">
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
          <div className="be-feedback-card be-feedback-sent" role="status" aria-live="polite">
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
            <button type="button" className="be-comp-save" onClick={() => router.push(ROUTES.brag)}>Back to brag doc</button>
          </div>
        ) : (
          <form
            className="be-feedback-card be-feedback-form"
            aria-label="Send app feedback"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSend()
            }}
          >
            <div className="be-feedback-grid">
              <label className="be-feedback-field">
                <span>What is this about?</span>
                <div className="be-feedback-select-wrap">
                  <select className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} autoFocus>
                    {CATEGORIES.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </div>
              </label>

              <label className="be-feedback-field">
                <span>How does it feel?</span>
                <div className="be-feedback-select-wrap">
                  <select className={fieldClass} value={feeling} onChange={(event) => setFeeling(event.target.value)}>
                    {FEELINGS.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </div>
              </label>

              <label className="be-feedback-field be-feedback-field--wide">
                <span>Short summary</span>
                <input className={fieldClass} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What should we know?" />
              </label>

              <label className="be-feedback-field be-feedback-field--wide">
                <span>Feedback for the app owners</span>
                <textarea className={areaClass} value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="Tell us what happened, what felt good, or what got in your way." />
              </label>

              <label className="be-feedback-field be-feedback-field--wide">
                <span>What would make it better?</span>
                <textarea className={areaClass} value={improvement} onChange={(event) => setImprovement(event.target.value)} rows={5} placeholder="A workflow, design, feature, or rough idea is perfect." />
              </label>
            </div>

            <label className="be-feedback-check">
              <input type="checkbox" checked={contactOk} onChange={(event) => setContactOk(event.target.checked)} />
              <span>The Clausule team may contact me about this feedback.</span>
            </label>

            <p className="be-feedback-note">Sent privately to the app owners. This will not appear in your brag doc.</p>

            <div className="be-feedback-actions">
              <button type="button" className="be-comp-cancel" onClick={() => router.push(ROUTES.brag)}>Cancel</button>
              <button type="submit" className="be-comp-save" disabled={!canSend}>Send feedback</button>
            </div>

            {error && <p className="be-comp-error" role="alert">{error}</p>}
          </form>
        )}
      </div>
    </main>
  )
}
