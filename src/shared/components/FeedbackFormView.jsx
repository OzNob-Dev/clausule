'use client'

import { Button } from '@shared/components/ui/Button'
import { Field, FieldCheckbox, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '@shared/components/ui/Field'
import { SectionCard } from '@shared/components/ui/SectionCard'
import { MailSendIcon } from '@shared/components/ui/icon/MailSendIcon'

export const FEEDBACK_CATEGORIES = ['Idea', 'Bug', 'Question', 'Complaint', 'Compliment']
export const FEEDBACK_FEELINGS = ['Just noting', 'Mildly annoying', 'Blocking me', 'Really excited']

function SendingState() {
  return (
    <div className="be-feedback-state flex flex-col items-center justify-center gap-4 rounded-[20px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] px-12 py-16 text-center" role="status" aria-live="polite" aria-label="Sending feedback">
      <div className="be-feedback-saving-mark relative grid h-28 w-28 place-items-center" aria-hidden="true">
        <span />
        <span />
        <span />
        <MailSendIcon size={48} className="text-[var(--cl-accent-deep)]" />
      </div>
      <p className="text-[var(--cl-text-lg)] font-bold text-[var(--cl-accent-deep)]">Sending feedback to Clausule</p>
    </div>
  )
}

function SentState({ userEmail, onClose }) {
  return (
    <div className="be-feedback-sent rounded-[20px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] px-10 py-12 text-center" role="status" aria-live="polite">
      <div className="be-feedback-party relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--cl-accent-soft-10)]" aria-hidden="true">
        <span className="be-feedback-party-burst absolute inset-0 animate-ping rounded-full bg-[var(--cl-accent-soft-11)] opacity-40" />
        <span className="be-feedback-party-spark be-feedback-party-spark--one absolute left-2 top-4 h-2 w-2 rounded-full bg-[var(--cl-accent-deep)]" />
        <span className="be-feedback-party-spark be-feedback-party-spark--two absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[var(--cl-accent-deep)]" />
        <span className="be-feedback-party-spark be-feedback-party-spark--three absolute bottom-4 right-2 h-2 w-2 rounded-full bg-[var(--cl-accent-deep)]" />
        <MailSendIcon className="be-feedback-party-mail relative z-[1] text-[var(--cl-accent-deep)]" />
      </div>
      <h2 className="[font-family:var(--cl-font-serif)] text-[32px] tracking-[-0.02em] text-[var(--cl-surface-ink-2)]">Your feedback has landed.</h2>
      <p className="mx-auto mt-3 max-w-[42ch] text-[var(--cl-text-base)] leading-[1.7] text-[var(--cl-surface-muted-8)]">
        Thank you for making Clausule sharper. We sent a tiny paper trail to
        {' '}
        <span className="be-feedback-sent-email font-bold text-[var(--cl-accent-deep)]">{userEmail || 'your account email'}</span>
        {' '}
        so you know it made it through.
      </p>
      <Button type="button" variant="primary" className="be-comp-save mt-6" onClick={onClose}>Back to brag doc</Button>
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
        headerClassName="be-feedback-card-head bg-[var(--cl-surface-ink-2)] px-8 py-5"
        titleClassName="be-feedback-card-title [font-family:var(--cl-font-serif)] text-[var(--cl-title-lg)] tracking-[-0.02em] text-[var(--cl-surface-muted-15)]"
        metaClassName="be-feedback-card-meta text-[var(--cl-surface-muted-7)]"
        bodyClassName="bss-form px-10 py-9 max-[860px]:px-6"
        title="Your feedback"
        meta="Sent privately"
        ariaLabel="Send app feedback"
        onSubmit={(event) => {
          event.preventDefault()
          void onSend()
        }}
      >
        <div className="be-feedback-grid grid grid-cols-2 gap-7 max-[860px]:grid-cols-1">
            <Field className="be-feedback-field be-feedback-field--select">
              <FieldLabel htmlFor="feedback-type">What is this about?</FieldLabel>
              <div className="be-feedback-select-wrap">
                <FieldSelect id="feedback-type" value={category} onChange={(event) => onCategoryChange(event.target.value)} autoFocus className="be-feedback-select min-h-[52px] rounded-[14px]">
                  {FEEDBACK_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
                </FieldSelect>
              </div>
            </Field>

            <Field className="be-feedback-field be-feedback-field--select">
              <FieldLabel htmlFor="feedback-feel">How does it feel?</FieldLabel>
              <div className="be-feedback-select-wrap">
                <FieldSelect id="feedback-feel" value={feeling} onChange={(event) => onFeelingChange(event.target.value)} className="be-feedback-select min-h-[52px] rounded-[14px]">
                  {FEEDBACK_FEELINGS.map((value) => <option key={value}>{value}</option>)}
                </FieldSelect>
              </div>
            </Field>

            <Field className="be-feedback-field be-feedback-field--wide col-span-2 max-[860px]:col-span-1">
              <FieldLabel htmlFor="summary">Short summary</FieldLabel>
              <FieldInput id="summary" value={subject} onChange={(event) => onSubjectChange(event.target.value)} placeholder="What should we know?" autoComplete="off" className="be-feedback-input-line min-h-[52px] rounded-[14px]" />
            </Field>

            <Field className="be-feedback-field be-feedback-field--wide col-span-2 max-[860px]:col-span-1">
              <FieldLabel htmlFor="feedback-body">Feedback for the app owners</FieldLabel>
              <FieldTextarea id="feedback-body" value={message} onChange={(event) => onMessageChange(event.target.value)} rows={5} placeholder="Tell us what happened, what felt good, or what got in your way." className="be-feedback-textarea rounded-[14px]" />
            </Field>

            <Field className="be-feedback-field be-feedback-field--wide col-span-2 max-[860px]:col-span-1" style={{ marginBottom: 0 }}>
              <FieldLabel htmlFor="improvement">What would make it better?</FieldLabel>
              <FieldTextarea id="improvement" value={improvement} onChange={(event) => onImprovementChange(event.target.value)} rows={5} placeholder="A workflow, design, feature, or rough idea is perfect." className="be-feedback-textarea rounded-[14px]" />
            </Field>
          </div>

        <div className="be-feedback-divider my-7 h-px bg-[var(--cl-ink-alpha-10)]" />

        <label className={contactOk ? 'be-feedback-check be-feedback-check--checked flex items-center gap-3 rounded-[14px] border border-[var(--cl-accent-soft-14)] bg-[var(--cl-accent-soft-10)] px-4 py-3' : 'be-feedback-check flex items-center gap-3 rounded-[14px] border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-4 py-3'} htmlFor="feedback-contact">
          <FieldCheckbox id="feedback-contact" className="be-feedback-check-input" checked={contactOk} onChange={(event) => onContactOkChange(event.target.checked)} />

          <span className="be-feedback-check-text text-[var(--cl-text-sm)] leading-[1.5] text-[var(--cl-surface-muted-8)]">The Clausule team may contact me about this feedback.</span>
        </label>

        <p className="form-buttons">Sent privately to the app owners. This will not appear in your brag doc.</p>

        <div className="be-feedback-actions mt-6 flex items-center justify-end gap-3 max-[560px]:flex-col-reverse max-[560px]:items-stretch">
          <Button type="button" variant="ghost" className="be-comp-cancel" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!canSend}>Send feedback</Button>
        </div>

        {error && <p className="be-comp-error" role="alert">{error}</p>}
      </SectionCard>
    </section>
  )
}
