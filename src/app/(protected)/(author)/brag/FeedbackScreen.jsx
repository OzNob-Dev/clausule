'use client'

import FeedbackComposer from '@brag/components/FeedbackComposer'
import FeedbackHistoryPanel from '@brag/components/FeedbackHistoryPanel'
import { useFeedbackThreadsQuery } from '@shared/queries/useFeedbackThreadsQuery'
import { useProfileStore } from '@auth/store/useProfileStore'
import '@brag/styles/brag-page.css'
import '@shared/styles/page-loader.css'

function FeedbackHero({ id, title, eyebrow, description }) {
  return (
    <header className="be-feedback-hero">
      <p className="be-feedback-eyebrow">{eyebrow}</p>
      <h1 id={id}>{title}</h1>
      {description ? <p className="be-feedback-hero-copy">{description}</p> : null}
    </header>
  )
}

function FeedbackHistoryScreen() {
  const feedbackQuery = useFeedbackThreadsQuery({ enabled: true })
  const threads = feedbackQuery.data ?? []
  const loading = feedbackQuery.isPending
  const loadError = feedbackQuery.error instanceof Error ? feedbackQuery.error.message : ''

  return (
    <main className="be-main page-enter" aria-labelledby="feedback-history-title">
      <div className="be-inner be-feedback-screen">
        <FeedbackHero
          id="feedback-history-title"
          eyebrow="Feedback centre"
          title="Back and forth with the Clausule team."
          description="Track what you sent and any replies from the people shaping the product."
        />
        <FeedbackHistoryPanel threads={threads} loading={loading} error={loadError} />
      </div>
    </main>
  )
}

function FeedbackComposeScreen({ userEmail }) {
  return (
    <main className="be-main page-enter" aria-labelledby="feedback-page-title">
      <div className="be-inner be-feedback-screen">
        <FeedbackHero
          id="feedback-page-title"
          eyebrow="Product feedback"
          title="Tell the Clausule team what would make this better."
        />
        <FeedbackComposer userEmail={userEmail} />
      </div>
    </main>
  )
}

export default function FeedbackScreen({ view = 'compose' }) {
  const userEmail = useProfileStore((state) => state.profile.email)
  return view === 'history' ? <FeedbackHistoryScreen /> : <FeedbackComposeScreen userEmail={userEmail} />
}
