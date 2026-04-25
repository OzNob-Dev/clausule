const EVIDENCE_TYPES = ['Work artefact', 'Metrics / data', 'Peer recognition', 'External link']

export function EvidenceTypeGroup({ selectedTypes, onToggle }) {
  return (
    <>
      <div className="be-comp-ev-label">Evidence types - tick all that apply</div>
      <div className="be-comp-ev-types" role="group" aria-label="Evidence types">
        {EVIDENCE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            aria-pressed={selectedTypes.has(type)}
            className={selectedTypes.has(type) ? 'be-comp-ev-type be-comp-ev-type--sel' : 'be-comp-ev-type'}
          >
            {type}
          </button>
        ))}
      </div>
    </>
  )
}

export function EvidenceUploadNotice() {
  const inputId = 'be-evidence-files'
  return (
    <>
      <div className="be-comp-ev-label" id={`${inputId}-label`}>Evidence files</div>
      <div className="be-dropzone" aria-labelledby={`${inputId}-label ${inputId}-text`} aria-describedby={`${inputId}-hint`} role="note">
        <svg className="be-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="be-dropzone-text" id={`${inputId}-text`}>File upload is not available yet</span>
        <span className="be-dropzone-sub" id={`${inputId}-hint`}>Save the entry first, then mention evidence links in the body for now.</span>
      </div>
    </>
  )
}
