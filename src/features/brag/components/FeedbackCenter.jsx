import { useEffect, useState } from 'react'
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
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    fetch('/api/feedback', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : { feedback: [] })
      .then((data) => {
        if (alive) setThreads(data.feedback ?? [])
      })
      .catch(() => {
        if (alive) setThreads([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const addThread = (thread) => {
    if (thread) setThreads((current) => [thread, ...current])
  }

  return (
    <section className="be-feedback-center" aria-label="Feedback centre">
      <FeedbackComposer userEmail={userEmail} onClose={onClose} onSent={addThread} />

      <div className="be-feedback-conversations">
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
