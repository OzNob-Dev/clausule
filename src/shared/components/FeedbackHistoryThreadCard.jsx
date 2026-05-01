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

export default function FeedbackHistoryThreadCard({ thread }) {
  return (
    <article className="be-feedback-history-view__card">
      <header className="be-feedback-history-view__card-head">
        <div>
          <div className="be-feedback-history-view__meta">
            <span className="be-feedback-history-view__type">{thread.category}</span>
            <span className="be-feedback-history-view__dot" aria-hidden="true" />
            <span className="be-feedback-history-view__feel">{thread.feeling}</span>
          </div>
          <h3 className="be-feedback-history-view__card-title">{thread.subject}</h3>
        </div>
        <time className="be-feedback-history-view__date" dateTime={thread.created_at}>{formatDate(thread.created_at)}</time>
      </header>

      <div className="be-feedback-history-view__messages">
        {buildMessages(thread).map((message) => (
          <div
            key={message.id}
            className={message.from_team ? 'be-feedback-history-view__message be-feedback-history-view__message--team' : 'be-feedback-history-view__message'}
            role="article"
            aria-label={message.from_team ? 'Clausule team reply' : 'Your message'}
          >
            <div className="be-feedback-history-view__message-head">
              <strong className="be-feedback-history-view__author">{message.from_team ? message.author_name || 'Clausule team' : 'You'}</strong>
              <time className="be-feedback-history-view__message-date" dateTime={message.created_at}>{formatDate(message.created_at)}</time>
            </div>
            <p className="be-feedback-history-view__message-body">{message.body}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
