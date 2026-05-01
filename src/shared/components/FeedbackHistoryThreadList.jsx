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
        <p className="be-feedback-history-view__empty" role="status">Gathering the paper trail...</p>
      ) : error ? (
        <p className="be-feedback-history-view__empty" role="alert">{error}</p>
      ) : threads.length ? (
        <ol className="be-feedback-history-view__list" aria-label="Feedback threads">
          {threads.map((thread) => (
            <li key={thread.id}>
              <FeedbackHistoryThreadCard thread={thread} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="be-feedback-history-view__empty">
          <p>{emptyCopy(filter).title}</p>
          <span>{emptyCopy(filter).body}</span>
        </div>
      )}
    </div>
  )
}
