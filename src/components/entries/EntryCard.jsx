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
          className="group cursor-pointer last:border-0 py-[18px] border-b border-[var(--border)] transition-[padding-left] duration-150 hover:pl-[5px]"
          onClick={() => setEditing(true)}
        >
          <div className="flex items-center gap-2 mb-2">
            <CategoryPill cat={entry.cat} />
            <span className="text-[11px] font-semibold text-[var(--tx-3)]">{relativeTime(entry.date)}</span>
            {entry.type && (
              <span className="text-[11px] text-[var(--tc)]">· {entry.type}</span>
            )}
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-[var(--tc)]">
              click to edit
            </span>
          </div>
          <h4 className="text-[17px] font-extrabold text-[var(--tx-1)] tracking-[-0.3px] leading-[1.25] mb-2">
            {title}
          </h4>
          <p className="text-[13px] text-[var(--tx-2)] leading-[1.75]">{body}</p>
          {entry.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.07)] text-[var(--tx-3)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-[16px_18px] mb-1 bg-[var(--bg-comp)] border-[1.5px] border-[var(--border2)] rounded-clausule2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full text-[16px] font-bold text-[var(--tx-1)] bg-transparent border-0 border-b-[1.5px] border-dashed border-[var(--border2)] outline-none mb-[10px] pb-[6px] font-[var(--font)]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full text-[13px] text-[var(--tx-1)] leading-[1.75] bg-[rgba(255,255,255,0.05)] border-[1.5px] border-[var(--border)] rounded-[var(--r)] p-[10px_12px] outline-none resize-none font-[var(--font)] mb-3 focus:border-[var(--acc-text)] transition-colors"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80 text-[11px] font-bold text-[var(--red)] bg-transparent border-0 cursor-pointer font-[var(--font)]"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                <polyline points="3 6 4 14 12 14 13 6"/><line x1="1" y1="6" x2="15" y2="6"/>
              </svg>
              Delete
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={() => setEditing(false)}
                className="text-[12px] font-semibold text-[var(--tx-3)] bg-transparent border-0 cursor-pointer font-[var(--font)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-[12px] font-bold px-[14px] py-[6px] bg-[var(--acc)] text-[var(--tx-1)] border-0 rounded-[var(--r)] cursor-pointer font-[var(--font)]"
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
