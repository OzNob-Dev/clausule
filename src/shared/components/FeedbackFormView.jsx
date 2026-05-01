'use client'

import { Button } from '@shared/components/ui/Button'
import { Field, FieldCheckbox, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '@shared/components/ui/Field'
import { SectionCard } from '@shared/components/ui/SectionCard'
import { MailSendIcon } from '@shared/components/ui/icon/MailSendIcon'

export const FEEDBACK_CATEGORIES = ['Idea', 'Bug', 'Question', 'Complaint', 'Compliment']
export const FEEDBACK_FEELINGS = ['Just noting', 'Mildly annoying', 'Blocking me', 'Really excited']

function SendingState() {
  return (
    <div className="be-feedback-state" role="status" aria-live="polite" aria-label="Sending feedback">
      <div className="be-feedback-saving-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <MailSendIcon size={48} />
      </div>
      <p>Sending feedback to Clausule</p>
    </div>
  )
}

function SentState({ userEmail, onClose }) {
  return (
    <div className="be-feedback-sent" role="status" aria-live="polite">
      <div className="be-feedback-party" aria-hidden="true">
        <span className="be-feedback-party-burst" />
        <span className="be-feedback-party-spark be-feedback-party-spark--one" />
        <span className="be-feedback-party-spark be-feedback-party-spark--two" />
        <span className="be-feedback-party-spark be-feedback-party-spark--three" />
        <MailSendIcon className="be-feedback-party-mail" />
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
  )
}

export default function FeedbackFormView({
  userEmail,
  category,
  feeling,
  subject,
  message,
  improvement,
  contactOk,
  canSend,
  sending,
  sent,
  error,
  onCategoryChange,
  onFeelingChange,
  onSubjectChange,
  onMessageChange,
  onImprovementChange,
  onContactOkChange,
  onCancel,
  onSend,
}) {
  if (sending) return <SendingState />
  if (sent) return <SentState userEmail={userEmail} onClose={onCancel} />

  return (
    <section className="bss-section" aria-label="Send app feedback">
      <SectionCard
        as="form"
        headerClassName="be-feedback-card-head"
        titleClassName="be-feedback-card-title"
        metaClassName="be-feedback-card-meta"
        bodyClassName="bss-form"
        title="Your feedback"
        meta="Sent privately"
        ariaLabel="Send app feedback"
        onSubmit={(event) => {
          event.preventDefault()
          void onSend()
        }}
      >
        <div className="be-feedback-grid">
            <Field className="be-feedback-field be-feedback-field--select">
              <FieldLabel htmlFor="feedback-type">What is this about?</FieldLabel>
              <div className="be-feedback-select-wrap">
                <FieldSelect id="feedback-type" value={category} onChange={(event) => onCategoryChange(event.target.value)} autoFocus className="be-feedback-select">
                  {FEEDBACK_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
                </FieldSelect>
              </div>
            </Field>

            <Field className="be-feedback-field be-feedback-field--select">
              <FieldLabel htmlFor="feedback-feel">How does it feel?</FieldLabel>
              <div className="be-feedback-select-wrap">
                <FieldSelect id="feedback-feel" value={feeling} onChange={(event) => onFeelingChange(event.target.value)} className="be-feedback-select">
                  {FEEDBACK_FEELINGS.map((value) => <option key={value}>{value}</option>)}
                </FieldSelect>
              </div>
            </Field>

            <Field className="be-feedback-field be-feedback-field--wide">
              <FieldLabel htmlFor="summary">Short summary</FieldLabel>
              <FieldInput id="summary" value={subject} onChange={(event) => onSubjectChange(event.target.value)} placeholder="What should we know?" autoComplete="off" className="be-feedback-input-line" />
            </Field>

            <Field className="be-feedback-field be-feedback-field--wide">
              <FieldLabel htmlFor="feedback-body">Feedback for the app owners</FieldLabel>
              <FieldTextarea id="feedback-body" value={message} onChange={(event) => onMessageChange(event.target.value)} rows={5} placeholder="Tell us what happened, what felt good, or what got in your way." className="be-feedback-textarea" />
            </Field>

            <Field className="be-feedback-field be-feedback-field--wide" style={{ marginBottom: 0 }}>
              <FieldLabel htmlFor="improvement">What would make it better?</FieldLabel>
              <FieldTextarea id="improvement" value={improvement} onChange={(event) => onImprovementChange(event.target.value)} rows={5} placeholder="A workflow, design, feature, or rough idea is perfect." className="be-feedback-textarea" />
            </Field>
          </div>

        <div className="be-feedback-divider" />

        <label className={contactOk ? 'be-feedback-check be-feedback-check--checked' : 'be-feedback-check'} htmlFor="feedback-contact">
          <FieldCheckbox id="feedback-contact" className="be-feedback-check-input" checked={contactOk} onChange={(event) => onContactOkChange(event.target.checked)} />

          <span className="be-feedback-check-text">The Clausule team may contact me about this feedback.</span>
        </label>

        <p className="form-buttons">Sent privately to the app owners. This will not appear in your brag doc.</p>

        <div className="be-feedback-actions">
          <Button type="button" variant="ghost" className="be-comp-cancel" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!canSend}>Send feedback</Button>
        </div>

        {error && <p className="be-comp-error" role="alert">{error}</p>}
      </SectionCard>
    </section>
  )
}
