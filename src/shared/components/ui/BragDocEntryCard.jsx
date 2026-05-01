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
  const pillTone = {
    gold: 'border-[var(--cl-gold-alpha-35)] bg-[var(--cl-gold-alpha-12)] text-[var(--cl-accent-code)]',
    filled: 'border-[var(--cl-accent-alpha-28)] bg-[var(--cl-accent-soft-13)] text-[var(--cl-accent-deeper)]',
    blue: 'border-[var(--cl-blue-alpha-24)] bg-[var(--cl-blue-alpha-08)] text-[var(--cl-blue)]',
    empty: 'border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] text-[var(--cl-surface-muted-8)]',
  }

  return (
    <article className="be-doc-entry-card rounded-[18px] border border-[var(--cl-ink-alpha-12)] bg-[var(--cl-surface-white)] p-6 shadow-[0_18px_40px_rgba(26,18,12,0.06)]">
      <div className="be-doc-entry-head mb-4 flex items-start justify-between gap-4">
        <h4 className="be-doc-entry-title [font-family:'DM_Serif_Display',Georgia,serif] text-[28px] leading-[1.05] tracking-[-0.02em] text-[var(--cl-surface-ink-2)]">{entry.title}</h4>
        <div className="be-doc-entry-date shrink-0 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.12em] text-[var(--cl-surface-muted-8)]">
          <time dateTime={entry.entry_date}>{dateLabel(entry.entry_date)}</time>
        </div>
      </div>
      <p className="be-doc-entry-body mb-5 text-[var(--cl-text-md)] leading-[1.7] text-[var(--cl-muted)]">{entry.body ?? ''}</p>
      <div className="be-doc-entry-footer flex flex-wrap items-start justify-between gap-4">
        <div className="be-doc-strength-indicator flex min-w-0 max-w-[320px] items-start gap-3">
          <div className="be-doc-strength-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cl-accent-soft-10)] text-[var(--cl-accent-deep)] [&_svg]:h-4 [&_svg]:w-4]" aria-hidden="true">
            <TargetIcon />
          </div>
          <div className="be-doc-strength-content min-w-0">
            <div className="be-doc-strength-label text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.1em] text-[var(--cl-accent-deep)]">{entry.strength}</div>
            <div className="be-doc-strength-description mt-1 text-[var(--cl-text-sm)] leading-[1.55] text-[var(--cl-surface-muted-8)]">{entry.strength_hint}</div>
          </div>
        </div>
        <div className="be-doc-evidence-tags flex flex-wrap justify-end gap-2" role="list" aria-label="Evidence">
          {pills.map((pill, i) => (
            <span key={`${pill.label}-${i}`} role="listitem" className={`be-ev-pill be-ev-pill--${pill.type} be-doc-evidence-tag be-doc-evidence-tag--${pill.type} inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[var(--cl-text-xs)] font-bold ${pillTone[pill.type]}`}>
              <span className="be-ev-pill-dot h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {pill.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
