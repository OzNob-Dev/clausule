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

function FileIcon({ type }) {
  return (
    <svg className="be-file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {type.startsWith('image/') ? (
        <><rect x="1" y="1" width="14" height="14" rx="2"/><circle cx="5.5" cy="5.5" r="1.5"/><polyline points="1 11 5 7 8 10 11 7 15 11"/></>
      ) : type.startsWith('video/') ? (
        <><rect x="1" y="3" width="14" height="10" rx="1.5"/><polyline points="6 7 10 9.5 6 12"/></>
      ) : (
        <><path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6z"/><polyline points="9 1 9 6 14 6"/></>
      )}
    </svg>
  )
}

function formatFileSize(size) {
  return size < 1024 * 1024 ? `${Math.round(size / 1024)}KB` : `${(size / (1024 * 1024)).toFixed(1)}MB`
}

export function FileDropzone({ active, fileInputRef, onAddFiles, onDrop, onSetActive }) {
  const inputId = 'be-evidence-files'
  return (
    <>
      <div className="be-comp-ev-label" id={`${inputId}-label`}>Evidence files</div>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        multiple
        onChange={(e) => { onAddFiles(e.target.files); e.target.value = '' }}
        className="sr-only"
        tabIndex={-1}
      />
      <button
        type="button"
        className={active ? 'be-dropzone be-dropzone--active' : 'be-dropzone'}
        onDragOver={(e) => { e.preventDefault(); onSetActive(true) }}
        onDragLeave={() => onSetActive(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        aria-labelledby={`${inputId}-label ${inputId}-text`}
        aria-describedby={`${inputId}-hint`}
      >
        <svg className="be-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="be-dropzone-text" id={`${inputId}-text`}>Drop files here or click to browse</span>
        <span className="be-dropzone-sub" id={`${inputId}-hint`}>Screenshots, videos, PDFs, documents</span>
      </button>
    </>
  )
}

export function AttachedFileList({ files, onRemove }) {
  if (!files.length) return null

  return (
    <ul className="be-file-list" aria-label="Attached files">
      {files.map((file) => (
        <li key={file.id} className="be-file-item">
          <FileIcon type={file.type} />
          <span className="be-file-name">{file.name}</span>
          <span className="be-file-size">{formatFileSize(file.size)}</span>
          <button type="button" onClick={() => onRemove(file.id)} className="be-file-remove" aria-label={`Remove ${file.name}`}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
