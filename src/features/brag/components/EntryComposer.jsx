import { useState, useRef } from 'react'
import { AttachedFileList, EvidenceTypeGroup, FileDropzone } from './EntryComposerParts'

export default function EntryComposer({ onSave, onClose }) {
  const [title, setTitle]         = useState('')
  const [body, setBody]           = useState('')
  const [evTypes, setEvTypes]     = useState(new Set())
  const [files, setFiles]         = useState([])
  const [dropActive, setDropActive] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
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

  const handleSave = async () => {
    if (!title.trim()) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/brag/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          entry_date: new Date().toISOString().slice(0, 10),
          evidence_types: [...evTypes],
          visible_to_manager: true,
        }),
      })

      if (!response.ok) throw new Error('Save failed')
      const { entry } = await response.json()
      onSave({ entry, evidenceTypes: [...evTypes], files })
    } catch {
      setError('Could not save this entry. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="be-composer-stage">
      <div className="be-composer-orbit" aria-hidden="true">
        <span className="be-composer-orbit-ring" />
        <span className="be-composer-orbit-dot" />
        <span className="be-composer-orbit-dot" />
        <span className="be-composer-orbit-dot" />
        <svg className="be-composer-orbit-pen" viewBox="0 0 48 48" fill="none">
          <path d="M13 34 11 41l7-2 20-20-5-5L13 34Z" fill="currentColor" opacity="0.16" />
          <path d="M13 34 11 41l7-2 20-20-5-5L13 34Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="m30 17 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

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
        <EvidenceTypeGroup selectedTypes={evTypes} onToggle={toggleEvType} />
        <FileDropzone
          active={dropActive}
          fileInputRef={fileInputRef}
          onAddFiles={addFiles}
          onDrop={handleDrop}
          onSetActive={setDropActive}
        />
        <AttachedFileList files={files} onRemove={removeFile} />
        <div className="be-comp-footer">
          <div />
          <div className="be-comp-btns">
            <button type="button" onClick={onClose} className="be-comp-cancel" disabled={saving}>Cancel</button>
            <button type="button" onClick={handleSave} className="be-comp-save" disabled={saving || !title.trim()}>
              {saving ? 'Saving...' : 'Save entry'}
            </button>
          </div>
        </div>
        {error && <p className="be-comp-error" role="alert">{error}</p>}
      </div>
    </div>
  )
}
