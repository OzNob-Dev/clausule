import { Button } from './Button'

export default function BragDocToolbar({ activeYear, entryCount = 0, years = [], onAddEntry, onYearSelect }) {
  const yearTabs = [...years, 'All']

  return (
    <div className="be-doc-toolbar">
      <Button type="button" variant="primary" className="be-doc-add-button justify-start" onClick={onAddEntry}>
        <span className="be-doc-add-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </span>
        <span className="be-doc-add-copy">
          <span className="be-doc-add-label">Add a win</span>
          <span className="be-doc-add-description">Capture a fresh entry for your brag doc</span>
        </span>
      </Button>

      <section className="be-doc-year-nav" aria-label="Year navigation">
        <span className="be-doc-year-nav-label">Year</span>
        <div className="be-doc-year-nav-tabs" role="group" aria-label="Choose a year">
          {yearTabs.map((year) => (
            <button
              key={year}
              type="button"
              className={`be-doc-year-tab${activeYear === year ? ' be-doc-year-tab--active' : ''}`}
              aria-pressed={activeYear === year}
              aria-controls={year === 'All' ? undefined : `be-doc-year-${year}`}
              onClick={() => onYearSelect(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </section>

      <div className="be-doc-entry-count" aria-label="Entry count">
        <strong>{entryCount}</strong>
        {entryCount === 1 ? 'entry' : 'entries'}
      </div>
    </div>
  )
}
