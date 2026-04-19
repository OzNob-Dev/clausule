import { useState } from 'react'
import { CategoryPill } from '@shared/components/ui/CategoryPill'
import { relativeTime } from '@shared/utils/relativeTime'
import '@features/manager/styles/entry-card.css'

export function EntryCard({ entry, onDelete, isFiltered }) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [title, setTitle] = useState(entry.title)
  const [body, setBody] = useState(entry.body)

  const handleSave = () => setEditing(false)

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
            {confirmDelete ? (
              <div className="ecard-del-confirm">
                <span className="ecard-del-confirm__text">Delete this entry?</span>
                <div className="ecard-del-confirm__actions">
                  <button onClick={() => setConfirmDelete(false)} className="ecard-cancel-btn">Cancel</button>
                  <button onClick={() => onDelete(entry.id)} className="ecard-del-confirm__yes">Delete</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="ecard-del-btn">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="3 6 4 14 12 14 13 6"/><line x1="1" y1="6" x2="15" y2="6"/>
                </svg>
                Delete
              </button>
            )}
            <div className="ecard-edit-actions">
              <button onClick={() => { setEditing(false); setConfirmDelete(false) }} className="ecard-cancel-btn">
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
