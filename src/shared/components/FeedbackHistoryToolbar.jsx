import './FeedbackHistoryToolbar.css'
const filterTabs = [
  ['all', 'All'],
  ['ideas', 'Ideas'],
  ['bugs', 'Bugs'],
  ['replied', 'Replied'],
]

export default function FeedbackHistoryToolbar({ activeFilter, count, onFilterChange }) {
  return (
    <div className="be-feedback-history-view__toolbar" role="toolbar" aria-label="Feedback filters">
      <div className="be-feedback-history-view__filter-group" role="group" aria-label="Filter by type">
        <span className="be-feedback-history-view__filter-label" aria-hidden="true">Show</span>
        <div className="be-feedback-history-view__filter-tabs">
          {filterTabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={activeFilter === value ? 'be-feedback-history-view__filter-tab is-active' : 'be-feedback-history-view__filter-tab'}
              aria-pressed={activeFilter === value}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="be-feedback-history-view__count" aria-live="polite">
        <strong>{count}</strong>
        <span>threads</span>
      </p>
    </div>
  )
}
