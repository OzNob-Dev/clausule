const EVIDENCE_TYPES = ['Work artefact', 'Metrics / data', 'Peer recognition', 'External link']

export function EvidenceTypeGroup({ selectedTypes, onToggle }) {
  return (
    <>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.8px] text-tx-4">Evidence types - tick all that apply</div>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Evidence types">
        {EVIDENCE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            aria-pressed={selectedTypes.has(type)}
            className={selectedTypes.has(type) ? 'rounded-full border border-transparent bg-acc-bg px-2.5 py-1 text-[11px] font-bold text-acc-text' : 'rounded-full border border-rule bg-transparent px-2.5 py-1 text-[11px] font-bold text-tx-3'}
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
    <svg className="h-4 w-4 shrink-0 text-tm" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
  return (
    <>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.8px] text-tx-4">Evidence files</div>
      <div
        className={active ? 'mb-3 flex cursor-pointer flex-col items-center justify-center rounded-[var(--r2)] border-2 border-dashed border-acc bg-acc-bg px-4 py-6 text-center outline-none' : 'mb-3 flex cursor-pointer flex-col items-center justify-center rounded-[var(--r2)] border-2 border-dashed border-border bg-transparent px-4 py-6 text-center outline-none'}
        onDragOver={(e) => { e.preventDefault(); onSetActive(true) }}
        onDragLeave={() => onSetActive(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Drop evidence files here or press Enter to browse"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => { onAddFiles(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <svg className="mb-2 h-6 w-6 text-tx-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="text-sm font-bold text-tp">Drop files here or click to browse</span>
        <span className="mt-1 text-[11px] text-tm">Screenshots, videos, PDFs, documents</span>
      </div>
    </>
  )
}

export function AttachedFileList({ files, onRemove }) {
  if (!files.length) return null

  return (
    <ul className="mb-3 space-y-2" aria-label="Attached files">
      {files.map((file) => (
        <li key={file.id} className="flex items-center gap-2 rounded-[var(--r)] border border-rule bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm">
          <FileIcon type={file.type} />
          <span className="min-w-0 flex-1 truncate text-tp">{file.name}</span>
          <span className="text-[11px] text-tm">{formatFileSize(file.size)}</span>
          <button type="button" onClick={() => onRemove(file.id)} className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-[var(--r)] border-none bg-transparent text-tm cursor-pointer hover:text-tp" aria-label={`Remove ${file.name}`}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
