'use client'

import FeedbackComposer from '@brag/components/FeedbackComposer'
import FeedbackHistoryPanel from '@brag/components/FeedbackHistoryPanel'
import Layout from '@brag/components/layout'
import PageHeader from '@shared/components/ui/PageHeader'
import { useFeedbackThreadsQuery } from '@shared/queries/useFeedbackThreadsQuery'
import { useProfileStore } from '@auth/store/useProfileStore'
import '@brag/styles/brag-page.css'
import '@shared/styles/page-loader.css'

function FeedbackHistoryScreen() {
  const feedbackQuery = useFeedbackThreadsQuery({ enabled: true })
  const threads = feedbackQuery.data ?? []
  const loading = feedbackQuery.isPending
  const loadError = feedbackQuery.error instanceof Error ? feedbackQuery.error.message : ''

  return (
    <Layout mainClassName="page-enter" innerClassName="be-feedback-screen" ariaLabelledby="feedback-history-title">
      <PageHeader
        className="be-feedback-hero"
        eyebrow="Feedback centre"
        eyebrowClassName="be-feedback-eyebrow"
        titleId="feedback-history-title"
        title="Back and forth with the Clausule team."
        description="Track what you sent and any replies from the people shaping the product."
        descriptionClassName="be-feedback-hero-copy"
      />
      <FeedbackHistoryPanel threads={threads} loading={loading} error={loadError} />
    </Layout>
  )
}

function FeedbackComposeScreen({ userEmail }) {
  return (
    <Layout mainClassName="page-enter" innerClassName="be-feedback-screen" ariaLabelledby="feedback-page-title">
      <PageHeader
        className="be-feedback-hero"
        eyebrow="Product feedback"
        eyebrowClassName="be-feedback-eyebrow"
        titleId="feedback-page-title"
        title="Tell the Clausule team what would make this better."
      />
      <FeedbackComposer userEmail={userEmail} />
    </Layout>
  )
}

export default function FeedbackScreen({ view = 'compose' }) {
  const userEmail = useProfileStore((state) => state.profile.email)
  return view === 'history' ? <FeedbackHistoryScreen /> : <FeedbackComposeScreen userEmail={userEmail} />
}
