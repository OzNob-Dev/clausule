import { useState } from 'react'
import { CategoryPill, CategoryDot } from '../ui/CategoryPill'
import { relativeTime } from '../../utils/relativeTime'

export function EntryCard({ entry, onDelete, filterActive, isFiltered }) {
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
      className={`transition-opacity duration-150 ${isFiltered ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
    >
      {!editing ? (
        <div
          className="group cursor-pointer last:border-0"
          style={{
            padding: '18px 0',
            borderBottom: '1px solid var(--border)',
            transition: 'padding-left 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '5px' }}
          onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '0' }}
          onClick={() => setEditing(true)}
        >
          <div className="flex items-center gap-2 mb-2">
            <CategoryPill cat={entry.cat} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tx-3)' }}>{relativeTime(entry.date)}</span>
            {entry.type && (
              <span style={{ fontSize: '11px', color: 'var(--tx-4)' }}>· {entry.type}</span>
            )}
            <span
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ fontSize: '10px', fontWeight: 600, color: 'var(--tx-4)' }}
            >
              click to edit
            </span>
          </div>
          <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--tx-1)', letterSpacing: '-0.3px', lineHeight: 1.25, marginBottom: '8px' }}>
            {title}
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--tx-2)', lineHeight: 1.75 }}>{body}</p>
          {entry.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--tx-3)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: '16px 18px',
            marginBottom: '4px',
            background: 'var(--bg-comp)',
            border: '1.5px solid var(--border2)',
            borderRadius: 'var(--r2)',
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--tx-1)',
              background: 'transparent',
              border: 'none',
              borderBottom: '1.5px dashed var(--border2)',
              outline: 'none',
              width: '100%',
              marginBottom: '10px',
              paddingBottom: '6px',
              fontFamily: 'var(--font)',
            }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            style={{
              fontSize: '13px',
              color: 'var(--tx-1)',
              lineHeight: 1.75,
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r)',
              padding: '10px 12px',
              outline: 'none',
              width: '100%',
              resize: 'none',
              fontFamily: 'var(--font)',
              marginBottom: '12px',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--acc-text)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                <polyline points="3 6 4 14 12 14 13 6"/><line x1="1" y1="6" x2="15" y2="6"/>
              </svg>
              Delete
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={() => setEditing(false)}
                style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-3)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ fontSize: '12px', fontWeight: 700, padding: '6px 14px', background: 'var(--acc)', color: 'var(--tx-1)', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'var(--font)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
