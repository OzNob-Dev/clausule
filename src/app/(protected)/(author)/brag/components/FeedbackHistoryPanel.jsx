import { useState } from 'react'
import FeedbackHistoryHeader from '@brag/components/FeedbackHistoryHeader'
import FeedbackHistoryToolbar from '@brag/components/FeedbackHistoryToolbar'
import FeedbackHistoryThreadList from '@brag/components/FeedbackHistoryThreadList'

function matchesFilter(thread, filter) {
  if (filter === 'all') return true
  if (filter === 'replied') return (thread.replies ?? []).length > 0
  return thread.category?.toLowerCase() === filter
}

export default function FeedbackHistoryPanel({ threads = [], loading = false, error = '' }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const filteredThreads = threads.filter((thread) => matchesFilter(thread, activeFilter))

  return (
    <section className="be-feedback-history-view" aria-label="Feedback history">
      <FeedbackHistoryHeader />
      <FeedbackHistoryToolbar activeFilter={activeFilter} count={filteredThreads.length} onFilterChange={setActiveFilter} />
      <FeedbackHistoryThreadList threads={filteredThreads} loading={loading} error={error} filter={activeFilter} />
    </section>
  )
}
