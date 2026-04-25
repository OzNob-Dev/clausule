import EntryRings from './EntryRings'
import { relativeTime } from '@shared/utils/relativeTime'

export default function EntryCard({ entry }) {
  return (
    <article className="be-entry-card">
      <div className="be-entry-head">
        <div className="be-entry-title">{entry.title}</div>
        <div className="be-entry-date">
          <time dateTime={entry.date}>{relativeTime(entry.date)}</time>
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
              <span key={`${pill.label}-${i}`} role="listitem" className={`be-ev-pill be-ev-pill--${pill.type}`}>
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
