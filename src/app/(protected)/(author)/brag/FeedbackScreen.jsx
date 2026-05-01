'use client'

import FeedbackComposer from '@shared/components/FeedbackComposer'
import FeedbackHistoryPanel from '@shared/components/FeedbackHistoryPanel'
import PageHeader from '@shared/components/ui/PageHeader'
import { useFeedbackThreadsQuery } from '@shared/queries/useFeedbackThreadsQuery'
import { useProfileStore } from '@auth/store/useProfileStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { ConversationIllustration } from '@shared/components/ui/icon/ConversationIllustration'
import '@shared/styles/page-loader.css'

function FeedbackHistoryEmptyState() {
  const router = useRouter()

  return (
    <section className="be-feedback-empty-state mx-auto flex max-w-[760px] flex-col items-center rounded-[24px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] px-8 py-10 text-center shadow-[0_20px_44px_rgba(26,18,12,0.05)]" aria-labelledby="feedback-empty-title" aria-describedby="feedback-empty-copy">
      <div className="be-feedback-empty-state__art mb-6" aria-hidden="true">
        <ConversationIllustration />
      </div>

      <p className="be-feedback-empty-state__eyebrow mb-3 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.16em] text-[var(--cl-accent-deep)]">Feedback history</p>
      <h2 id="feedback-empty-title" className="be-feedback-empty-state__title [font-family:'DM_Serif_Display',Georgia,serif] text-[clamp(2.3rem,5vw,3.8rem)] leading-[0.98] tracking-[-0.03em] text-[var(--cl-surface-ink-2)]">The conversation<br />hasn't started <em className="text-[var(--cl-accent-deep)]">yet.</em></h2>
      <p id="feedback-empty-copy" className="be-feedback-empty-state__copy mt-4 max-w-[38ch] text-[var(--cl-text-lg)] leading-[1.7] text-[var(--cl-surface-muted-8)]">Send your first note and this centre will start keeping the conversation cozy.</p>
      <button type="button" className="be-feedback-empty-state__cta mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--cl-accent-deep)] px-5 py-3 text-[var(--cl-text-base)] font-bold text-[var(--cl-surface-paper)] shadow-[0_16px_34px_var(--cl-accent-soft-21)] transition-transform duration-150 hover:-translate-y-0.5" onClick={() => router.push('/brag/feedback')}>
        <span className="be-feedback-empty-state__cta-icon flex h-6 w-6 items-center justify-center rounded-md bg-[var(--cl-black-20)]" aria-hidden="true">
          <ArrowIcon />
        </span>
        Send your first note
      </button>
    </section>
  )
}

function FeedbackHistoryScreen() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  const feedbackQuery = useFeedbackThreadsQuery({ enabled: ready })
  const threads = feedbackQuery.data ?? []
  const loading = ready && feedbackQuery.isPending
  const loadError = feedbackQuery.error instanceof Error ? feedbackQuery.error.message : ''
  const hasHistory = threads.length > 0

  return (
    <>
    {!hasHistory && <FeedbackHistoryEmptyState />}
    {loading || loadError || hasHistory &&
      <>
        <PageHeader
          className="bss-header mb-8"
          eyebrow="Feedback history"
          eyebrowClassName="bss-eyebrow mb-[10px] text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.14em] text-[var(--cl-accent-deep)]"
          titleId="feedback-history-title"
          title="Back and forth with the Clausule team."
          titleClassName="bss-heading [font-family:var(--cl-font-serif)] text-[clamp(2.5rem,4.6vw,3.4rem)] leading-[1.02] tracking-[-0.02em] text-[var(--cl-surface-ink-2)]"
          description="Track what you sent and any replies from the people shaping the product."
          descriptionClassName="bss-subheading text-[clamp(1rem,1.8vw,1.125rem)] leading-[1.6] text-[var(--cl-surface-muted-9)]"
        />
        <div className="bss-divider mb-11 h-0.5 bg-[linear-gradient(90deg,var(--cl-accent-deep)_0%,var(--cl-accent-soft-11)_58%,transparent_100%)]" />
        <FeedbackHistoryPanel threads={threads} loading={loading} error={loadError} />
      </>}
    </>
  )
}

function FeedbackComposeScreen({ userEmail }) {
  return (
    <>
      <PageHeader
        className="bss-header mb-8"
        eyebrow="Product feedback"
        eyebrowClassName="bss-eyebrow mb-[10px] text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.14em] text-[var(--cl-accent-deep)]"
        titleId="feedback-page-title"
        title="Feedback for Clausule"
        titleClassName="bss-heading [font-family:var(--cl-font-serif)] text-[clamp(2.5rem,4.6vw,3.4rem)] leading-[1.02] tracking-[-0.02em] text-[var(--cl-surface-ink-2)]"
        description="Tell the Clausule team what would make this better."
        descriptionClassName="bss-subheading text-[clamp(1rem,1.8vw,1.125rem)] leading-[1.6] text-[var(--cl-surface-muted-9)]"
      />
      <FeedbackComposer userEmail={userEmail} />
    </>
  )
}

export default function FeedbackScreen({ view = 'compose' }) {
  const userEmail = useProfileStore((state) => state.profile.email)
  return view === 'history' ? <FeedbackHistoryScreen /> : <FeedbackComposeScreen userEmail={userEmail} />
}
