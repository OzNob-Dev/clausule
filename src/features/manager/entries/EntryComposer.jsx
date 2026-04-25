import { useState } from 'react'
import { cn } from '@shared/utils/cn'

const CATS = [
  { id: 'perf',    label: 'Performance', unsel: 'bg-blb text-blt', sel: 'bg-blt text-[#FAF7F3]' },
  { id: 'conduct', label: 'Conduct',     unsel: 'bg-ab text-at',   sel: 'bg-at text-[#FAF7F3]' },
  { id: 'dev',     label: 'Development', unsel: 'bg-gb text-gt',   sel: 'bg-gt text-[#FAF7F3]' },
]

const TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident']

export function EntryComposer({ onSave, onClose }) {
  const [cat, setCat] = useState('perf')
  const [type, setType] = useState('Note')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ cat, type, title, body, date: new Date().toISOString().split('T')[0], id: crypto.randomUUID(), tags: [] })
    onClose()
  }

  return (
    <div className="mb-4 rounded-[var(--r2)] border border-rule bg-card p-4">
      <div className="mb-3 flex items-center gap-[0.375rem]">
        {CATS.map((c) => {
          const isSel = cat === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-bold font-sans transition-colors duration-150 border-none cursor-pointer",
                isSel ? c.sel : c.unsel
              )}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-[0.375rem]">
        {TYPES.map((t) => {
          const isSel = type === t
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-bold font-sans transition-colors duration-150 border cursor-pointer",
                isSel 
                  ? "bg-acc-tint text-acc-text border-transparent"
                  : "border-rule bg-transparent text-ts"
              )}
            >
              {t}
            </button>
          )
        })}
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title…" autoFocus className="mb-3 w-full border-none border-b border-rule bg-transparent pb-2 font-sans text-sm font-bold text-tp outline-none" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Details…" rows={3} className="mb-3 block w-full resize-none rounded p-2.5 font-sans text-[13px] text-ts outline-none border border-rule bg-[rgba(255,255,255,0.04)]" />
      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={!title.trim()} className="cursor-pointer rounded-[var(--r)] border-none bg-acc px-3.5 py-1.5 font-sans text-xs font-bold text-[#FAF7F3] transition-opacity duration-150 hover:opacity-90 disabled:cursor-default disabled:opacity-40">
          Save entry
        </button>
        <button onClick={onClose} className="border-none bg-transparent font-sans text-xs text-tm cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  )
}
