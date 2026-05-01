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
    <article className="be-feedback-history-view__card rounded-[18px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] p-5 shadow-[0_12px_28px_rgba(26,18,12,0.04)]">
      <header className="be-feedback-history-view__card-head mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="be-feedback-history-view__meta mb-2 flex items-center gap-2 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.12em] text-[var(--cl-surface-muted-8)]">
            <span className="be-feedback-history-view__type">{thread.category}</span>
            <span className="be-feedback-history-view__dot h-1 w-1 rounded-full bg-[var(--cl-accent-deep)]" aria-hidden="true" />
            <span className="be-feedback-history-view__feel">{thread.feeling}</span>
          </div>
          <h3 className="be-feedback-history-view__card-title text-[var(--cl-text-lg)] font-bold text-[var(--cl-surface-ink-2)]">{thread.subject}</h3>
        </div>
        <time className="be-feedback-history-view__date shrink-0 text-[var(--cl-text-xs)] uppercase tracking-[0.12em] text-[var(--cl-surface-muted-8)]" dateTime={thread.created_at}>{formatDate(thread.created_at)}</time>
      </header>

      <div className="be-feedback-history-view__messages grid gap-3">
        {buildMessages(thread).map((message) => (
          <div
            key={message.id}
            className={message.from_team ? 'be-feedback-history-view__message be-feedback-history-view__message--team rounded-[14px] border border-[var(--cl-accent-soft-14)] bg-[var(--cl-accent-soft-10)] px-4 py-3' : 'be-feedback-history-view__message rounded-[14px] border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-4 py-3'}
            role="article"
            aria-label={message.from_team ? 'Clausule team reply' : 'Your message'}
          >
            <div className="be-feedback-history-view__message-head mb-2 flex items-center justify-between gap-3">
              <strong className="be-feedback-history-view__author text-[var(--cl-text-sm)] font-bold text-[var(--cl-surface-ink-2)]">{message.from_team ? message.author_name || 'Clausule team' : 'You'}</strong>
              <time className="be-feedback-history-view__message-date text-[var(--cl-text-xs)] uppercase tracking-[0.12em] text-[var(--cl-surface-muted-8)]" dateTime={message.created_at}>{formatDate(message.created_at)}</time>
            </div>
            <p className="be-feedback-history-view__message-body text-[var(--cl-text-sm)] leading-[1.6] text-[var(--cl-surface-muted-8)]">{message.body}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
