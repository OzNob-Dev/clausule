'use client'

import FeedbackComposer from '@brag/components/FeedbackComposer'
import FeedbackHistoryPanel from '@brag/components/FeedbackHistoryPanel'
import Layout from '@brag/components/layout'
import PageHeader from '@shared/components/ui/PageHeader'
import { useFeedbackThreadsQuery } from '@shared/queries/useFeedbackThreadsQuery'
import { useProfileStore } from '@auth/store/useProfileStore'
import { useRouter } from 'next/navigation'
import '@brag/styles/brag-settings-core.css'
import '@brag/styles/brag-page.css'
import '@shared/styles/page-loader.css'

function FeedbackHistoryEmptyState() {
  const router = useRouter()

  return (
    <section className="be-feedback-empty-state" aria-labelledby="feedback-empty-title" aria-describedby="feedback-empty-copy">
      <div className="be-feedback-empty-state__art" aria-hidden="true">
        <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" width="220" height="160">
          <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--one">
            <rect x="10" y="96" width="90" height="38" rx="10" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
            <rect x="10" y="128" width="12" height="8" rx="0 0 0 6" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
            <rect x="21" y="108" width="44" height="5" rx="2.5" fill="#E0D9CE" />
            <rect x="21" y="118" width="30" height="5" rx="2.5" fill="#E0D9CE" />
          </g>
          <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--two">
            <rect x="116" y="50" width="96" height="44" rx="10" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
            <rect x="198" y="88" width="14" height="8" rx="0 0 6 0" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
            <rect x="126" y="63" width="50" height="5" rx="2.5" fill="#E8C4B4" />
            <rect x="126" y="73" width="36" height="5" rx="2.5" fill="#E8C4B4" />
          </g>
          <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--three">
            <rect x="10" y="20" width="98" height="44" rx="10" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
            <rect x="10" y="56" width="14" height="10" rx="0 0 0 6" fill="#FFF" stroke="rgba(28,26,23,0.1)" strokeWidth="0.8" />
            <rect x="22" y="32" width="56" height="5" rx="2.5" fill="#E0D9CE" />
            <rect x="22" y="42" width="40" height="5" rx="2.5" fill="#E0D9CE" />
            <rect x="22" y="52" width="48" height="5" rx="2.5" fill="#E0D9CE" />
          </g>
          <g className="be-feedback-empty-state__bubble be-feedback-empty-state__bubble--four">
            <rect x="114" y="110" width="96" height="36" rx="10" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
            <rect x="196" y="140" width="14" height="7" rx="0 0 6 0" fill="#FAF0EA" stroke="rgba(196,107,74,0.2)" strokeWidth="0.8" />
            <circle className="be-feedback-empty-state__dot be-feedback-empty-state__dot--one" cx="149" cy="128" r="3.5" fill="#C46B4A" />
            <circle className="be-feedback-empty-state__dot be-feedback-empty-state__dot--two" cx="162" cy="128" r="3.5" fill="#C46B4A" />
            <circle className="be-feedback-empty-state__dot be-feedback-empty-state__dot--three" cx="175" cy="128" r="3.5" fill="#C46B4A" />
          </g>
          <g className="be-feedback-empty-state__arrow">
            <circle cx="110" cy="80" r="14" fill="#EAE4DA" />
            <path d="M104 80h12M110 74l6 6-6 6" stroke="#C46B4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>

      <p className="be-feedback-empty-state__eyebrow">Feedback history</p>
      <h2 id="feedback-empty-title" className="be-feedback-empty-state__title">The conversation<br />hasn't started <em>yet.</em></h2>
      <p id="feedback-empty-copy" className="be-feedback-empty-state__copy">Send your first note and this centre will start keeping the conversation cozy.</p>
      <button type="button" className="be-feedback-empty-state__cta" onClick={() => router.push('/brag/feedback')}>
        <span className="be-feedback-empty-state__cta-icon" aria-hidden="true">
          <svg viewBox="0 0 12 12" fill="none">
            <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <polyline points="7,2 11,6 7,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
    <Layout mainClassName="page-enter bss-screen" innerClassName="bss-page" ariaLabelledby="feedback-history-title">
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
      {loading || loadError || hasHistory ? <FeedbackHistoryPanel threads={threads} loading={loading} error={loadError} /> : <FeedbackHistoryEmptyState />}
    </Layout>
  )
}

function FeedbackComposeScreen({ userEmail }) {
  return (
    <Layout mainClassName="page-enter bss-screen" innerClassName="bss-page" ariaLabelledby="feedback-page-title">
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
    </Layout>
  )
}

export default function FeedbackScreen({ view = 'compose' }) {
  const userEmail = useProfileStore((state) => state.profile.email)
  return view === 'history' ? <FeedbackHistoryScreen /> : <FeedbackComposeScreen userEmail={userEmail} />
}
