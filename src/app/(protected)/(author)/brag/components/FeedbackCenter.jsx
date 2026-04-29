import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@shared/components/ui/Button'
import FeedbackComposer from '@brag/components/FeedbackComposer'
import FeedbackHistoryPanel from '@brag/components/FeedbackHistoryPanel'
import { useFeedbackThreadsQuery } from '@shared/queries/useFeedbackThreadsQuery'

export default function FeedbackCenter({ userEmail, onClose }) {
  const [activeTab, setActiveTab] = useState('compose')
  const tabOrder = ['compose', 'centre']
  const queryClient = useQueryClient()
  const feedbackQuery = useFeedbackThreadsQuery({ enabled: activeTab === 'centre' })

  const threads = feedbackQuery.data ?? []
  const loading = feedbackQuery.isPending
  const loadError = feedbackQuery.error instanceof Error ? feedbackQuery.error.message : ''
  const hasHistory = threads.length > 0
  const showHistoryPanel = activeTab === 'centre' && (loading || loadError || hasHistory)
  const showEmptyState = activeTab === 'centre' && !loading && !loadError && !hasHistory

  const addThread = (thread) => {
    if (thread) queryClient.setQueryData(['feedback', 'threads'], (current = []) => [thread, ...current])
  }

  const openCompose = () => {
    setActiveTab('compose')
    document.getElementById('feedback-compose-tab')?.focus()
  }

  const moveTab = (direction) => {
    const currentIndex = tabOrder.indexOf(activeTab)
    const nextIndex = direction === 'start'
      ? 0
      : direction === 'end'
        ? tabOrder.length - 1
        : (currentIndex + direction + tabOrder.length) % tabOrder.length
    const nextTab = tabOrder[nextIndex]
    setActiveTab(nextTab)
    document.getElementById(`feedback-${nextTab}-tab`)?.focus()
  }

  const handleTabKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveTab(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveTab(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      moveTab('start')
    } else if (event.key === 'End') {
      event.preventDefault()
      moveTab('end')
    }
  }

  return (
    <section className="be-feedback-center" aria-label="Feedback centre">
      <div className="be-feedback-tabs" role="tablist" aria-label="Feedback sections">
        <Button
          type="button"
          id="feedback-compose-tab"
          className={activeTab === 'compose' ? 'be-feedback-tab be-feedback-tab-active' : 'be-feedback-tab'}
          role="tab"
          aria-selected={activeTab === 'compose'}
          aria-controls="feedback-compose-panel"
          tabIndex={activeTab === 'compose' ? 0 : -1}
          onClick={() => setActiveTab('compose')}
          onKeyDown={handleTabKeyDown}
        >
          Send feedback
        </Button>
        <Button
          type="button"
          id="feedback-centre-tab"
          className={activeTab === 'centre' ? 'be-feedback-tab be-feedback-tab-active' : 'be-feedback-tab'}
          role="tab"
          aria-selected={activeTab === 'centre'}
          aria-controls="feedback-centre-panel"
          tabIndex={activeTab === 'centre' ? 0 : -1}
          onClick={() => setActiveTab('centre')}
          onKeyDown={handleTabKeyDown}
        >
          Feedback centre
        </Button>
      </div>

      <div
        id="feedback-compose-panel"
        role="tabpanel"
        aria-labelledby="feedback-compose-tab"
        hidden={activeTab !== 'compose'}
      >
        <FeedbackComposer userEmail={userEmail} onClose={onClose} onSent={addThread} />
      </div>

      {showHistoryPanel && (
        <div
          id="feedback-centre-panel"
          className="be-feedback-history-view"
          role="tabpanel"
          aria-labelledby="feedback-centre-tab"
        >
          <FeedbackHistoryPanel threads={threads} loading={loading} error={loadError} />
        </div>
      )}

      {showEmptyState && (
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
          <button type="button" className="be-feedback-empty-state__cta" onClick={openCompose}>
            <span className="be-feedback-empty-state__cta-icon" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none">
                <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <polyline points="7,2 11,6 7,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Send your first note
          </button>
        </section>
      )}
    </section>
  )
}
