import { useEffect, useState } from 'react'
import { cn } from '@shared/utils/cn'
import { CategoryPill } from '@shared/components/ui/CategoryPill'
import { relativeTime } from '@shared/utils/relativeTime'

export function EntryCard({ entry, onDelete, onSave, isFiltered }) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [title, setTitle] = useState(entry.title)
  const [body, setBody] = useState(entry.body)

  // Sync edit fields when entry prop updates (e.g. after server refresh)
  useEffect(() => {
    setTitle(entry.title)
    setBody(entry.body)
  }, [entry.title, entry.body])

  const handleSave = () => {
    onSave?.({ ...entry, title, body })
    setEditing(false)
  }

  const handleCancel = () => {
    setTitle(entry.title)
    setBody(entry.body)
    setEditing(false)
    setConfirmDelete(false)
  }

  return (
    <div
      data-cat={entry.cat}
      className={cn(
        "transition-opacity duration-150",
        isFiltered && "opacity-20 pointer-events-none"
      )}
    >
      {!editing ? (
        <button type="button" className="group block w-full border-0 border-b border-border bg-transparent px-0 py-[18px] text-left font-sans text-inherit cursor-pointer transition-[padding-left] duration-150 last:border-b-0 hover:pl-[5px] focus-visible:pl-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-acc-text focus-visible:outline-offset-4" onClick={() => setEditing(true)}>
          <div className="flex items-center gap-2 mb-2">
            <CategoryPill cat={entry.cat} />
            <span className="text-[11px] font-semibold text-tx-3">{relativeTime(entry.date)}</span>
            {entry.type && (
              <span className="text-[11px] text-tc">· {entry.type}</span>
            )}
            <span className="ml-auto opacity-0 transition-opacity duration-150 text-[10px] font-semibold text-tc group-hover:opacity-100">click to edit</span>
          </div>
          <h4 className="text-[17px] font-extrabold text-tx-1 tracking-[-0.3px] leading-[1.25] mb-2">{title}</h4>
          <p className="text-[13px] text-tx-2 leading-[1.75]">{body}</p>
          {entry.tags?.length > 0 && (
            <div className="flex gap-[6px] flex-wrap mt-2">
              {entry.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold py-[2px] px-2 rounded-full bg-[rgba(255,255,255,0.07)] text-tx-3">#{tag}</span>
              ))}
            </div>
          )}
        </button>
      ) : (
        <div className="mb-1 rounded-[var(--r2)] border-[1.5px] border-border2 bg-bg-comp px-[18px] py-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            aria-label="Entry title"
            className="mb-2.5 w-full border-none border-b-[1.5px] border-dashed border-border2 bg-transparent pb-[6px] font-sans text-base font-bold text-tx-1 outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            aria-label="Entry details"
            className="mb-3 block box-border min-w-0 w-full resize-none rounded-[var(--r)] border-[1.5px] border-border bg-[rgba(255,255,255,0.05)] px-3 py-2.5 font-sans text-[13px] leading-[1.75] text-tx-1 outline-none transition-colors duration-150 focus:border-acc-text"
          />
          <div className="flex items-center justify-between">
            {confirmDelete ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-tx-2">Delete this entry?</span>
                <div className="flex gap-[6px]">
                  <button type="button" onClick={() => setConfirmDelete(false)} className="border-none bg-transparent font-sans text-xs font-semibold text-tx-3 cursor-pointer">Cancel</button>
                  <button type="button" onClick={() => onDelete(entry.id)} className="rounded-[var(--r)] border-none bg-red px-3 py-[5px] font-sans text-[11px] font-bold text-[#FAF7F3] cursor-pointer">Delete</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-[6px] border-none bg-transparent font-sans text-[11px] font-bold text-red cursor-pointer transition-opacity duration-150 hover:opacity-80 [&>svg]:h-3 [&>svg]:w-3">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <polyline points="3 6 4 14 12 14 13 6"/><line x1="1" y1="6" x2="15" y2="6"/>
                </svg>
                Delete
              </button>
            )}
            <div className="flex gap-[6px]">
              <button type="button" onClick={handleCancel} className="border-none bg-transparent font-sans text-xs font-semibold text-tx-3 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="rounded-[var(--r)] border-none bg-acc px-[14px] py-[6px] font-sans text-xs font-bold text-[#FAF7F3] cursor-pointer">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
