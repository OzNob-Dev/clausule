const dateFmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })

function formatDate(value) {
  return dateFmt.format(new Date(value))
}

function buildMessages(thread) {
  return [
    { id: `${thread.id}-user`, author: 'You', body: thread.message, created_at: thread.created_at, from_team: false },
    ...(thread.replies ?? []),
  ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}

export default function FeedbackHistoryPanel({ threads = [], loading = false, error = '' }) {
  const content = loading
    ? <p className="be-feedback-thread-empty" role="status">Gathering the paper trail...</p>
    : error
      ? <p className="be-feedback-thread-empty" role="alert">{error}</p>
      : threads.length
        ? (
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
        )
        : (
          <div className="be-feedback-thread-empty">
            <p>No feedback threads yet.</p>
            <span>Send the first note and this centre will start keeping the conversation cozy.</span>
          </div>
        )

  return <section className="be-feedback-conversations" aria-label="Feedback history">{content}</section>
}
