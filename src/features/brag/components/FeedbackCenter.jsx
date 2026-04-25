import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import FeedbackComposer from '@features/brag/components/FeedbackComposer'

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
}

function buildMessages(thread) {
  return [
    { id: `${thread.id}-user`, author: 'You', body: thread.message, created_at: thread.created_at, from_team: false },
    ...(thread.replies ?? []),
  ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}

export default function FeedbackCenter({ userEmail, onClose }) {
  const [activeTab, setActiveTab] = useState('compose')
  const queryClient = useQueryClient()
  const feedbackQuery = useQuery({
    queryKey: ['feedback', 'threads'],
    queryFn: async () => {
      const response = await fetch('/api/feedback', { credentials: 'same-origin' })
      if (!response.ok) return []
      const data = await response.json().catch(() => ({ feedback: [] }))
      return data.feedback ?? []
    },
    retry: false,
  })

  const threads = feedbackQuery.data ?? []
  const loading = feedbackQuery.isPending

  const addThread = (thread) => {
    if (thread) queryClient.setQueryData(['feedback', 'threads'], (current = []) => [thread, ...current])
  }

  return (
    <section className="be-feedback-center" aria-label="Feedback centre">
      <div className="be-feedback-tabs" role="tablist" aria-label="Feedback sections">
        <button
          type="button"
          id="feedback-compose-tab"
          className={activeTab === 'compose' ? 'be-feedback-tab be-feedback-tab-active' : 'be-feedback-tab'}
          role="tab"
          aria-selected={activeTab === 'compose'}
          aria-controls="feedback-compose-panel"
          onClick={() => setActiveTab('compose')}
        >
          Send feedback
        </button>
        <button
          type="button"
          id="feedback-centre-tab"
          className={activeTab === 'centre' ? 'be-feedback-tab be-feedback-tab-active' : 'be-feedback-tab'}
          role="tab"
          aria-selected={activeTab === 'centre'}
          aria-controls="feedback-centre-panel"
          onClick={() => setActiveTab('centre')}
        >
          Feedback centre
        </button>
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
        className="be-feedback-conversations"
        role="tabpanel"
        aria-labelledby="feedback-centre-tab"
        hidden={activeTab !== 'centre'}
      >
        <div className="be-feedback-conversations-head">
          <p className="be-feedback-eyebrow">Feedback centre</p>
          <h2>Back and forth with the Clausule team.</h2>
          <p>Track what you sent and any replies from the people shaping the product.</p>
        </div>

        {loading ? (
          <p className="be-feedback-thread-empty" role="status">Gathering the paper trail...</p>
        ) : threads.length ? (
          <div className="be-feedback-thread-list">
            {threads.map((thread) => (
              <article className="be-feedback-thread" key={thread.id}>
                <header className="be-feedback-thread-head">
                  <div>
                    <p>{thread.category} · {thread.feeling}</p>
                    <h3>{thread.subject}</h3>
                  </div>
                  <span>{formatDate(thread.created_at)}</span>
                </header>

                <div className="be-feedback-thread-flow">
                  {buildMessages(thread).map((message) => (
                    <div className={message.from_team ? 'be-feedback-message be-feedback-message--team' : 'be-feedback-message'} key={message.id}>
                      <div>
                        <strong>{message.from_team ? message.author_name || 'Clausule team' : 'You'}</strong>
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                      <p>{message.body}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="be-feedback-thread-empty">
            <p>No feedback threads yet.</p>
            <span>Send the first note and this centre will start keeping the conversation cozy.</span>
          </div>
        )}
      </div>
    </section>
  )
}
