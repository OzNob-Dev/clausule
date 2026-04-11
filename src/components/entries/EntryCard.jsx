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
        <div className="group py-4 border-b border-[rgba(0,0,0,0.07)] last:border-0">
          <div className="flex items-start gap-3">
            <CategoryDot
              cat={entry.cat}
              size={8}
              className="mt-1.5 flex-shrink-0"
              onClick={filterActive ? () => filterActive(entry.cat) : undefined}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-[14px] font-medium text-tp dark:text-tp-dark">{title}</h4>
                <button
                  onClick={() => setEditing(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-bl hover:underline flex-shrink-0"
                >
                  Edit
                </button>
              </div>
              <p className="text-[13px] text-ts dark:text-[#9A9994] leading-relaxed mb-2">{body}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-tm dark:text-[#6B6B68]">{relativeTime(entry.date)}</span>
                <span className="text-[11px] text-tc">·</span>
                <CategoryPill cat={entry.cat} />
                {entry.type && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.05)] text-ts">{entry.type}</span>
                )}
                {entry.tags?.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-tm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 border-b border-[rgba(0,0,0,0.07)] last:border-0 bg-[rgba(0,0,0,0.02)] -mx-4 px-4 rounded-ledger">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[14px] font-medium text-tp dark:text-tp-dark bg-transparent border-0 border-b border-[rgba(0,0,0,0.12)] pb-1.5 mb-3 outline-none focus:border-bl"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full text-[13px] text-ts dark:text-[#9A9994] bg-transparent border border-[rgba(0,0,0,0.09)] rounded p-2 resize-none outline-none focus:border-bl mb-3"
          />
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="text-[12px] text-[#3B6D11] font-medium hover:opacity-80">Save</button>
            <button onClick={() => setEditing(false)} className="text-[12px] text-tm hover:text-ts">Cancel</button>
            <button onClick={handleDelete} className="text-[12px] text-rt hover:opacity-80 ml-auto">Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}
