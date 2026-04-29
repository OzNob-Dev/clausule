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

  const addThread = (thread) => {
    if (thread) queryClient.setQueryData(['feedback', 'threads'], (current = []) => [thread, ...current])
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

      <div
        id="feedback-centre-panel"
        className="be-feedback-history-view"
        role="tabpanel"
        aria-labelledby="feedback-centre-tab"
        hidden={activeTab !== 'centre'}
      >
        <FeedbackHistoryPanel threads={threads} loading={loading} error={loadError} />
      </div>
    </section>
  )
}
