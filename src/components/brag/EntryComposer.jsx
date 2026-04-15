import { useState, useRef } from 'react'

const EVIDENCE_TYPES = ['Work artefact', 'Metrics / data', 'Peer recognition', 'External link']

export default function EntryComposer({ onSave, onClose }) {
  const [title, setTitle]         = useState('')
  const [body, setBody]           = useState('')
  const [evTypes, setEvTypes]     = useState(new Set())
  const [files, setFiles]         = useState([])
  const [dropActive, setDropActive] = useState(false)
  const fileInputRef              = useRef(null)

  const toggleEvType = (type) => {
    setEvTypes((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const addFiles = (fileList) => {
    const mapped = [...fileList].map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      type: f.type,
    }))
    setFiles((prev) => [...prev, ...mapped])
  }

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const handleDrop = (e) => {
    e.preventDefault()
    setDropActive(false)
    addFiles(e.dataTransfer.files)
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      id: Date.now(),
      title: title.trim(),
      date: new Date().toISOString().slice(0, 10),
      body: body.trim(),
      strength: evTypes.size >= 3 ? 'Exceptional' : evTypes.size >= 2 ? 'Solid' : 'Good',
      strengthHint: files.length
        ? `${files.length} file${files.length !== 1 ? 's' : ''} attached`
        : 'Evidence added',
      ringOffsets: [
        evTypes.size >= 1 ? 0 : 113.1,
        evTypes.size >= 2 ? 0 : 75.4,
        evTypes.size >= 3 ? 0 : 37.7,
      ],
      pills: files.slice(0, 4).map((f) => ({ label: f.name.replace(/\.[^.]+$/, ''), type: 'filled' })),
    })
  }

  return (
    <div className="be-composer" role="form" aria-label="Add a new entry">
      <input
        type="text"
        className="be-comp-title"
        placeholder="What did you achieve?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <textarea
        className="be-comp-body"
        rows={4}
        placeholder="Describe what you did, what the impact was, and how you know it worked."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="be-comp-ev-label">Evidence types — tick all that apply</div>
      <div className="be-comp-ev-types" role="group" aria-label="Evidence types">
        {EVIDENCE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleEvType(type)}
            aria-pressed={evTypes.has(type)}
            className={`be-comp-ev-type${evTypes.has(type) ? ' be-comp-ev-type--sel' : ''}`}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="be-comp-count-label">Evidence files</div>
      <div
        className={`be-dropzone${dropActive ? ' be-dropzone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDropActive(true) }}
        onDragLeave={() => setDropActive(false)}
        onDrop={handleDrop}
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
          onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <svg className="be-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="be-dropzone-text">Drop files here or click to browse</span>
        <span className="be-dropzone-sub">Screenshots, videos, PDFs, documents</span>
      </div>

      {files.length > 0 && (
        <ul className="be-file-list" aria-label="Attached files">
          {files.map((file) => (
            <li key={file.id} className="be-file-item">
              <svg className="be-file-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {file.type.startsWith('image/') ? (
                  <><rect x="1" y="1" width="14" height="14" rx="2"/><circle cx="5.5" cy="5.5" r="1.5"/><polyline points="1 11 5 7 8 10 11 7 15 11"/></>
                ) : file.type.startsWith('video/') ? (
                  <><rect x="1" y="3" width="14" height="10" rx="1.5"/><polyline points="6 7 10 9.5 6 12"/></>
                ) : (
                  <><path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6z"/><polyline points="9 1 9 6 14 6"/></>
                )}
              </svg>
              <span className="be-file-name">{file.name}</span>
              <span className="be-file-size">
                {file.size < 1024 * 1024
                  ? `${Math.round(file.size / 1024)}KB`
                  : `${(file.size / (1024 * 1024)).toFixed(1)}MB`}
              </span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="be-file-remove"
                aria-label={`Remove ${file.name}`}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="be-comp-footer">
        <div />
        <div className="be-comp-btns">
          <button type="button" onClick={onClose} className="be-comp-cancel">Cancel</button>
          <button type="button" onClick={handleSave} className="be-comp-save">Save entry</button>
        </div>
      </div>
    </div>
  )
}
