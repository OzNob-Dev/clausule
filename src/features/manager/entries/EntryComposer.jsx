import { useState } from 'react'
import '@features/manager/styles/entry-composer.css'

const CATS = [
  { id: 'perf',    label: 'Performance' },
  { id: 'conduct', label: 'Conduct'     },
  { id: 'dev',     label: 'Development' },
]

const TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident']

export function EntryComposer({ onSave, onClose }) {
  const [cat, setCat] = useState('perf')
  const [type, setType] = useState('Note')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ cat, type, title, body, date: new Date().toISOString().split('T')[0], id: Date.now().toString(), tags: [] })
    onClose()
  }

  return (
    <div className="ec-composer">
      {/* Category pills */}
      <div className="ec-cat-row">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`ec-cat-btn ec-cat-btn--${c.id}${cat === c.id ? ' ec-cat-btn--sel' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Type pills */}
      <div className="ec-type-row">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`ec-type-btn${type === t ? ' ec-type-btn--sel' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title…"
        autoFocus
        className="ec-title-input"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Details…"
        rows={3}
        className="ec-body-textarea"
      />
      <div className="ec-actions">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="ec-btn-save"
        >
          Save entry
        </button>
        <button onClick={onClose} className="ec-btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  )
}
