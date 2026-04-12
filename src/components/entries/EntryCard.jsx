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
        <div className="group py-4 last:border-0" style={{ borderBottom: '1px solid var(--rule)' }}>
          <div className="flex items-start gap-3">
            <CategoryDot
              cat={entry.cat}
              size={8}
              className="mt-1.5 flex-shrink-0"
              onClick={filterActive ? () => filterActive(entry.cat) : undefined}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-[14px] font-bold" style={{ color: 'var(--tp)' }}>{title}</h4>
                <button
                  onClick={() => setEditing(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] hover:underline flex-shrink-0"
                  style={{ color: 'var(--bl)' }}
                >
                  Edit
                </button>
              </div>
              <p className="text-[13px] leading-relaxed mb-2" style={{ color: 'var(--ts)' }}>{body}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px]" style={{ color: 'var(--tm)' }}>{relativeTime(entry.date)}</span>
                <span className="text-[11px]" style={{ color: 'var(--tc)' }}>·</span>
                <CategoryPill cat={entry.cat} />
                {entry.type && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--ts)' }}
                  >
                    {entry.type}
                  </span>
                )}
                {entry.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--tm)' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="py-4 last:border-0 -mx-4 px-4 rounded-clausule2"
          style={{ borderBottom: '1px solid var(--rule)', background: 'rgba(255,255,255,0.03)' }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[14px] font-bold bg-transparent border-0 pb-1.5 mb-3 outline-none"
            style={{
              color: 'var(--tp)',
              borderBottom: '1px solid var(--rule-em)',
            }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full text-[13px] rounded p-2 resize-none outline-none mb-3"
            style={{
              color: 'var(--ts)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--rule)',
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="text-[12px] font-bold hover:opacity-80"
              style={{ color: 'var(--gt)' }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-[12px] hover:opacity-80"
              style={{ color: 'var(--tm)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="text-[12px] hover:opacity-80 ml-auto"
              style={{ color: 'var(--rt)' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
