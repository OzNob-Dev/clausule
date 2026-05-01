import { TargetIcon } from '@shared/components/ui/icon/TargetIcon'
function evidenceTypeToPill(type) {
  if (type === 'Metrics / data') return { label: 'Metrics', type: 'gold' }
  if (type === 'Work artefact') return { label: 'Work artefact', type: 'filled' }
  if (type === 'Peer recognition') return { label: 'Peer recognition', type: 'blue' }
  return { label: 'External link', type: 'empty' }
}

function evidenceTypesFromEntry(entry) {
  return (entry.brag_entry_evidence ?? []).map(({ type }) => type).filter(Boolean)
}

function dateLabel(entryDate) {
  const then = new Date(entryDate)
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const diff = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(then.getFullYear(), then.getMonth(), then.getDate())) / dayMs)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(then)
}

export default function BragDocEntryCard({ entry }) {
  const pills = evidenceTypesFromEntry(entry).slice(0, 4).map(evidenceTypeToPill)

  return (
    <article className="be-doc-entry-card">
      <div className="be-doc-entry-head">
        <h4 className="be-doc-entry-title">{entry.title}</h4>
        <div className="be-doc-entry-date">
          <time dateTime={entry.entry_date}>{dateLabel(entry.entry_date)}</time>
        </div>
      </div>
      <p className="be-doc-entry-body">{entry.body ?? ''}</p>
      <div className="be-doc-entry-footer">
        <div className="be-doc-strength-indicator">
          <div className="be-doc-strength-icon" aria-hidden="true">
            <TargetIcon />
          </div>
          <div className="be-doc-strength-content">
            <div className="be-doc-strength-label">{entry.strength}</div>
            <div className="be-doc-strength-description">{entry.strength_hint}</div>
          </div>
        </div>
        <div className="be-doc-evidence-tags" role="list" aria-label="Evidence">
          {pills.map((pill, i) => (
            <span key={`${pill.label}-${i}`} role="listitem" className={`be-ev-pill be-ev-pill--${pill.type} be-doc-evidence-tag be-doc-evidence-tag--${pill.type}`}>
              <span className="be-ev-pill-dot" aria-hidden="true" />
              {pill.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
