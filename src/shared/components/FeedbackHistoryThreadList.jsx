import FeedbackHistoryThreadCard from '@shared/components/FeedbackHistoryThreadCard'

function emptyCopy(filter) {
  return filter === 'replied'
    ? { title: 'No replied threads yet.', body: 'Once the Clausule team answers, those threads will appear here.' }
    : filter === 'ideas'
      ? { title: 'No ideas yet.', body: 'Send an idea and it will show up in this view.' }
      : filter === 'bugs'
        ? { title: 'No bugs yet.', body: 'Report an issue and this view will keep the trail tidy.' }
        : { title: 'No feedback threads yet.', body: 'Send the first note and this centre will start keeping the conversation cozy.' }
}

export default function FeedbackHistoryThreadList({ threads = [], loading = false, error = '', filter = 'all' }) {
  return (
    <div className="be-feedback-history-view__body">
      {loading ? (
        <p className="be-feedback-history-view__empty rounded-[18px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] px-6 py-8 text-center text-[var(--cl-text-base)] text-[var(--cl-surface-muted-8)]" role="status">Gathering the paper trail...</p>
      ) : error ? (
        <p className="be-feedback-history-view__empty rounded-[18px] border border-[var(--cl-danger-alpha-18)] bg-[var(--cl-surface-white)] px-6 py-8 text-center text-[var(--cl-text-base)] text-[var(--cl-danger-4)]" role="alert">{error}</p>
      ) : threads.length ? (
        <ol className="be-feedback-history-view__list grid gap-4" aria-label="Feedback threads">
          {threads.map((thread) => (
            <li key={thread.id}>
              <FeedbackHistoryThreadCard thread={thread} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="be-feedback-history-view__empty rounded-[18px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-white)] px-6 py-8 text-center">
          <p className="text-[var(--cl-text-lg)] font-bold text-[var(--cl-surface-ink-2)]">{emptyCopy(filter).title}</p>
          <span className="mt-2 block text-[var(--cl-text-sm)] leading-[1.6] text-[var(--cl-surface-muted-8)]">{emptyCopy(filter).body}</span>
        </div>
      )}
    </div>
  )
}
