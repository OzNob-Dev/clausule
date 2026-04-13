import { useState } from 'react'
import { CategoryPill } from '../ui/CategoryPill'
import { relativeTime } from '../../utils/relativeTime'
import '../../styles/entry-card.css'

export function EntryCard({ entry, onDelete, isFiltered }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(entry.title)
  const [body, setBody] = useState(entry.body)

  const handleSave = () => setEditing(false)
  const handleDelete = () => {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      onDelete(entry.id)
    }
  }

  return (
    <div
      data-cat={entry.cat}
      className={`ecard-wrap${isFiltered ? ' ecard-wrap--filtered' : ''}`}
    >
      {!editing ? (
        <div className="ecard-view" onClick={() => setEditing(true)}>
          <div className="ecard-meta">
            <CategoryPill cat={entry.cat} />
            <span className="ecard-time">{relativeTime(entry.date)}</span>
            {entry.type && (
              <span className="ecard-type">· {entry.type}</span>
            )}
            <span className="ecard-hint">click to edit</span>
          </div>
          <h4 className="ecard-title">{title}</h4>
          <p className="ecard-body">{body}</p>
          {entry.tags?.length > 0 && (
            <div className="ecard-tags">
              {entry.tags.map((tag) => (
                <span key={tag} className="ecard-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="ecard-edit">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="ecard-edit-title"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="ecard-edit-body"
          />
          <div className="ecard-edit-foot">
            <button onClick={handleDelete} className="ecard-del-btn">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3 6 4 14 12 14 13 6"/><line x1="1" y1="6" x2="15" y2="6"/>
              </svg>
              Delete
            </button>
            <div className="ecard-edit-actions">
              <button onClick={() => setEditing(false)} className="ecard-cancel-btn">
                Cancel
              </button>
              <button onClick={handleSave} className="ecard-save-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
