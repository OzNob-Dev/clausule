import { Button } from './Button'
import { UploadIcon } from '@shared/components/ui/icon/UploadIcon'
const EVIDENCE_TYPES = ['Work artefact', 'Metrics / data', 'Peer recognition', 'External link']

const STRENGTH_LEVELS = [
  { label: 'Needs work', hint: 'Select at least one evidence type', width: '0%' },
  { label: 'Developing', hint: 'Add another evidence type to strengthen', width: '33%' },
  { label: 'Solid', hint: 'One more evidence type reaches Strong', width: '66%' },
  { label: 'Strong', hint: 'All evidence types covered - great entry', width: '100%' },
]

export function EntryEvidenceTypeGroup({ selectedTypes = new Set(), onToggle = () => {} }) {
  return (
    <section className="be-entry-evidence-section mb-6">
      <div className="be-entry-section-label mb-3 flex items-center gap-3 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.16em] text-[var(--cl-accent-deep)] after:h-px after:flex-1 after:bg-[var(--cl-accent-soft-14)] after:content-['']" id="be-entry-evidence-label">Evidence types - tick all that apply</div>
      <div className="be-entry-pills flex flex-wrap gap-2.5" role="group" aria-labelledby="be-entry-evidence-label">
        {EVIDENCE_TYPES.map((type) => {
          const selected = selectedTypes.has(type)
          return (
            <Button
              key={type}
              type="button"
              variant="ghost"
              aria-pressed={selected}
              onClick={() => onToggle(type)}
              className={selected ? 'be-entry-pill be-entry-pill--selected rounded-full border border-[var(--cl-accent-soft-14)] bg-[var(--cl-accent-soft-13)] px-4 py-2 text-[var(--cl-text-sm)] font-bold text-[var(--cl-accent-deeper)] shadow-none' : 'be-entry-pill rounded-full border border-[var(--cl-border-2)] bg-[var(--cl-surface-paper)] px-4 py-2 text-[var(--cl-text-sm)] font-bold text-[var(--cl-surface-muted-8)] shadow-none hover:bg-[var(--cl-rule-2)]'}
            >
              <span className={`be-entry-pill-dot h-1.5 w-1.5 rounded-full ${selected ? 'bg-[var(--cl-accent-deep)]' : 'bg-[var(--cl-surface-muted-8)]'}`} aria-hidden="true" />
              {type}
            </Button>
          )
        })}
      </div>
    </section>
  )
}

export function EntryStrengthMeter({ selectedCount = 0 }) {
  const level = STRENGTH_LEVELS[Math.min(selectedCount, STRENGTH_LEVELS.length - 1)]

  return (
    <div className="be-entry-strength-meter mb-6 rounded-[16px] border border-[var(--cl-ink-alpha-10)] bg-[var(--cl-surface-muted-16)] p-4" role="status" aria-live="polite" aria-atomic="true">
      <div className="be-entry-strength-info mb-3">
        <div className="be-entry-strength-label text-[var(--cl-text-sm)] font-bold uppercase tracking-[0.12em] text-[var(--cl-accent-deep)]">{level.label}</div>
        <div className="be-entry-strength-hint mt-1 text-[var(--cl-text-sm)] leading-[1.55] text-[var(--cl-surface-muted-8)]">{level.hint}</div>
      </div>
      <div
        className="be-entry-strength-bar h-2 overflow-hidden rounded-full bg-[var(--cl-accent-soft-11)]"
        role="progressbar"
        aria-label="Entry strength"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(level.width.replace('%', ''))}
        aria-valuetext={level.label}
      >
        <div className="be-entry-strength-fill h-full rounded-full bg-[linear-gradient(90deg,var(--cl-accent-deep)_0%,var(--cl-accent-deeper)_100%)] transition-[width] duration-200" style={{ width: level.width }} />
      </div>
    </div>
  )
}

export function EntryEvidenceFilesNotice() {
  return (
    <section className="be-entry-files-section">
      <div className="be-entry-section-label mb-3 flex items-center gap-3 text-[var(--cl-text-xs)] font-bold uppercase tracking-[0.16em] text-[var(--cl-accent-deep)] after:h-px after:flex-1 after:bg-[var(--cl-accent-soft-14)] after:content-['']" id="be-entry-files-label">Evidence files</div>
      <div className="be-entry-files-dropzone rounded-[16px] border border-dashed border-[var(--cl-border-2)] bg-[var(--cl-surface-muted-16)] px-5 py-6 text-center" role="region" aria-labelledby="be-entry-files-label">
        <div className="be-entry-files-icon mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cl-accent-soft-10)] text-[var(--cl-accent-deep)]" aria-hidden="true">
          <UploadIcon />
        </div>
        <div className="be-entry-files-title text-[var(--cl-text-base)] font-bold text-[var(--cl-surface-ink-2)]">File upload is not available yet</div>
        <div className="be-entry-files-sub mt-1 text-[var(--cl-text-sm)] leading-[1.55] text-[var(--cl-surface-muted-8)]">Save the entry first, then mention evidence links in the body for now.</div>
      </div>
    </section>
  )
}
