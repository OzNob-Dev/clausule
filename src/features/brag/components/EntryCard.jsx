import EntryRings from './EntryRings'

function formatRelativeDate(dateStr) {
  const then = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return 'today'
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${Math.floor(diffMonths / 12)}y ago`
}

export default function EntryCard({ entry }) {
  return (
    <article className="be-entry-card">
      <div className="be-entry-head">
        <div className="be-entry-title">{entry.title}</div>
        <div className="be-entry-date">
          <time dateTime={entry.date}>{formatRelativeDate(entry.date)}</time>
        </div>
      </div>
      <p className="be-entry-body">{entry.body}</p>
      <div className="be-evidence-row">
        <EntryRings offsets={entry.ringOffsets} />
        <div>
          <div className="be-strength-word">{entry.strength}</div>
          <div className="be-strength-hint">{entry.strengthHint}</div>
          <div className="be-ev-pills" role="list" aria-label="Evidence">
            {entry.pills.map((pill, i) => (
              <span key={i} role="listitem" className={`be-ev-pill be-ev-pill--${pill.type}`}>
                <span className="be-ev-pill-dot" aria-hidden="true" />
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
