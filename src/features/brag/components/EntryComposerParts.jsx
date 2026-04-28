import { Button } from '@shared/components/ui/Button'

const EVIDENCE_TYPES = ['Work artefact', 'Metrics / data', 'Peer recognition', 'External link']

export function EvidenceTypeGroup({ selectedTypes, onToggle }) {
  return (
    <section className="be-entry-section">
      <span className="be-entry-label">Evidence types - tick all that apply</span>
      <div className="be-entry-tags" role="group" aria-label="Evidence types">
        {EVIDENCE_TYPES.map((type) => (
          <Button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            aria-pressed={selectedTypes.has(type)}
            className={selectedTypes.has(type) ? 'be-entry-tag be-entry-tag--selected' : 'be-entry-tag'}
            variant="ghost"
          >
            {type}
          </Button>
        ))}
      </div>
    </section>
  )
}

export function EvidenceUploadNotice() {
  return (
    <section className="be-entry-section">
      <span className="be-entry-label">Evidence files</span>
      <div className="be-entry-dropzone" role="note" aria-label="Evidence files unavailable">
        <svg className="be-entry-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="be-entry-dropzone-title">File upload is not available yet</span>
        <span className="be-entry-dropzone-sub">Save the entry first, then mention evidence links in the body for now.</span>
      </div>
    </section>
  )
}
