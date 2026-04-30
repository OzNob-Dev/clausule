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
    <section className="be-entry-evidence-section">
      <div className="be-entry-section-label" id="be-entry-evidence-label">Evidence types - tick all that apply</div>
      <div className="be-entry-pills" role="group" aria-labelledby="be-entry-evidence-label">
        {EVIDENCE_TYPES.map((type) => {
          const selected = selectedTypes.has(type)
          return (
            <Button
              key={type}
              type="button"
              variant="ghost"
              aria-pressed={selected}
              onClick={() => onToggle(type)}
              className={selected ? 'be-entry-pill be-entry-pill--selected' : 'be-entry-pill'}
            >
              <span className="be-entry-pill-dot" aria-hidden="true" />
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
    <div className="be-entry-strength-meter" role="status" aria-live="polite" aria-atomic="true">
      <div className="be-entry-strength-info">
        <div className="be-entry-strength-label">{level.label}</div>
        <div className="be-entry-strength-hint">{level.hint}</div>
      </div>
      <div
        className="be-entry-strength-bar"
        role="progressbar"
        aria-label="Entry strength"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(level.width.replace('%', ''))}
        aria-valuetext={level.label}
      >
        <div className="be-entry-strength-fill" style={{ width: level.width }} />
      </div>
    </div>
  )
}

export function EntryEvidenceFilesNotice() {
  return (
    <section className="be-entry-files-section">
      <div className="be-entry-section-label" id="be-entry-files-label">Evidence files</div>
      <div className="be-entry-files-dropzone" role="region" aria-labelledby="be-entry-files-label">
        <div className="be-entry-files-icon" aria-hidden="true">
          <UploadIcon />
        </div>
        <div className="be-entry-files-title">File upload is not available yet</div>
        <div className="be-entry-files-sub">Save the entry first, then mention evidence links in the body for now.</div>
      </div>
    </section>
  )
}
