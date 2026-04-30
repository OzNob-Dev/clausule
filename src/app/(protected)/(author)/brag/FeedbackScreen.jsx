'use client'

import FeedbackComposer from '@brag/components/FeedbackComposer'
import FeedbackHistoryPanel from '@brag/components/FeedbackHistoryPanel'
import PageHeader from '@shared/components/ui/PageHeader'
import { useFeedbackThreadsQuery } from '@shared/queries/useFeedbackThreadsQuery'
import { useProfileStore } from '@auth/store/useProfileStore'
import { useRouter } from 'next/navigation'
import { ArrowIcon } from '@shared/components/ui/icon/ArrowIcon'
import { ConversationIllustration } from '@shared/components/ui/icon/ConversationIllustration'
import '@brag/styles/brag-settings-core.css'
import '@brag/styles/brag-feedback.css'
import '@shared/styles/page-loader.css'

function FeedbackHistoryEmptyState() {
  const router = useRouter()

  return (
    <section className="be-feedback-empty-state" aria-labelledby="feedback-empty-title" aria-describedby="feedback-empty-copy">
      <div className="be-feedback-empty-state__art" aria-hidden="true">
        <ConversationIllustration />
      </div>

      <p className="be-feedback-empty-state__eyebrow">Feedback history</p>
      <h2 id="feedback-empty-title" className="be-feedback-empty-state__title">The conversation<br />hasn't started <em>yet.</em></h2>
      <p id="feedback-empty-copy" className="be-feedback-empty-state__copy">Send your first note and this centre will start keeping the conversation cozy.</p>
      <button type="button" className="be-cta" onClick={() => router.push('/brag/feedback')}>
        <span className="be-feedback-empty-state__cta-icon" aria-hidden="true">
          <ArrowIcon />
        </span>
        Send your first note
      </button>
    </section>
  )
}

function FeedbackHistoryScreen() {
  const feedbackQuery = useFeedbackThreadsQuery({ enabled: true })
  const threads = feedbackQuery.data ?? []
  const loading = feedbackQuery.isPending
  const loadError = feedbackQuery.error instanceof Error ? feedbackQuery.error.message : ''
  const hasHistory = threads.length > 0

  return (
    <>
    {!hasHistory && <FeedbackHistoryEmptyState />}
    {loading || loadError || hasHistory &&
      <>
        <PageHeader
          className="bss-header"
          eyebrow="Feedback history"
          eyebrowClassName="bss-eyebrow"
          titleId="feedback-history-title"
          title="Back and forth with the Clausule team."
          titleClassName="bss-heading"
          description="Track what you sent and any replies from the people shaping the product."
          descriptionClassName="bss-subheading"
        />
        <div className="bss-divider" />
        <FeedbackHistoryPanel threads={threads} loading={loading} error={loadError} />
      </>}
    </>
  )
}

function FeedbackComposeScreen({ userEmail }) {
  return (
    <>
      <PageHeader
        className="bss-header"
        eyebrow="Product feedback"
        eyebrowClassName="bss-eyebrow"
        titleId="feedback-page-title"
        title="Feedback for Clausule"
        titleClassName="bss-heading"
        description="Tell the Clausule team what would make this better."
        descriptionClassName="bss-subheading"
      />
      <FeedbackComposer userEmail={userEmail} />
    </>
  )
}

export default function FeedbackScreen({ view = 'compose' }) {
  const userEmail = useProfileStore((state) => state.profile.email)
  return view === 'history' ? <FeedbackHistoryScreen /> : <FeedbackComposeScreen userEmail={userEmail} />
}
