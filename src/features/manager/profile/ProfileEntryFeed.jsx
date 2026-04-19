import { EntryCard } from '@features/manager/entries/EntryCard'
import { EntryComposer } from '@features/manager/entries/EntryComposer'

const FILTERS = [
  { key: null, label: 'All' },
  { key: 'perf', label: 'Performance' },
  { key: 'conduct', label: 'Conduct' },
  { key: 'dev', label: 'Development' },
]

export default function ProfileEntryFeed({
  composerOpen,
  entries,
  filterCat,
  onAddEntry,
  onDeleteEntry,
  onFilterDot,
  onSetComposerOpen,
  onSetFilterCat,
}) {
  return (
    <div className="pf-doc">
      <div className="pf-filter-row">
        <div className="pf-filter-pills">
          {FILTERS.map(({ key, label }) => (
            <button
              key={label}
              onClick={() => onSetFilterCat(key)}
              className={`pf-filter-btn${filterCat === key ? ' pf-filter-btn--active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="pf-entry-count">{entries.length} entries</span>
      </div>

      {!composerOpen && (
        <div onClick={() => onSetComposerOpen(true)} className="pf-composer-trigger">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          Add entry
        </div>
      )}

      {composerOpen && <EntryComposer onSave={onAddEntry} onClose={() => onSetComposerOpen(false)} />}

      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onDelete={onDeleteEntry}
          filterActive={onFilterDot}
          isFiltered={filterCat !== null && filterCat !== entry.cat}
        />
      ))}
    </div>
  )
}
