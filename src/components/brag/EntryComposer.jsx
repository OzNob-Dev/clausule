import { useState, useRef } from 'react'
import { AttachedFileList, EvidenceTypeGroup, FileDropzone } from './EntryComposerParts'

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
          <button type="button" onClick={onClose} className="be-comp-cancel">Cancel</button>
          <button type="button" onClick={handleSave} className="be-comp-save">Save entry</button>
        </div>
      </div>
    </div>
  )
}
