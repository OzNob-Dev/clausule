const filterTabs = [
  ['all', 'All'],
  ['ideas', 'Ideas'],
  ['bugs', 'Bugs'],
  ['replied', 'Replied'],
]

export default function FeedbackHistoryToolbar({ activeFilter, count, onFilterChange }) {
  return (
    <div className="be-feedback-history-view__toolbar mb-5 flex flex-wrap items-center justify-between gap-4" role="toolbar" aria-label="Feedback filters">
      <div className="be-feedback-history-view__filter-group flex flex-wrap items-center gap-3" role="group" aria-label="Filter by type">
        <span className="be-feedback-history-view__filter-label text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.14em] text-[var(--cl-accent-deep)]" aria-hidden="true">Show</span>
        <div className="be-feedback-history-view__filter-tabs flex flex-wrap gap-2">
          {filterTabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={activeFilter === value ? 'be-feedback-history-view__filter-tab is-active rounded-full bg-[var(--cl-accent-deep)] px-3 py-1.5 text-[var(--cl-text-xs)] font-bold text-[var(--cl-surface-paper)]' : 'be-feedback-history-view__filter-tab rounded-full border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-3 py-1.5 text-[var(--cl-text-xs)] font-bold text-[var(--cl-surface-muted-8)] hover:bg-[var(--cl-rule-2)]'}
              aria-pressed={activeFilter === value}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="be-feedback-history-view__count text-[var(--cl-text-sm)] text-[var(--cl-surface-muted-8)]" aria-live="polite">
        <strong className="mr-1 text-[var(--cl-text-lg)] text-[var(--cl-surface-ink-2)]">{count}</strong>
        <span>threads</span>
      </p>
    </div>
  )
}
