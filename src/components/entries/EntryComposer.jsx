import { useState } from 'react'

const CATS = [
  { id: 'perf',    label: 'Performance', bg: 'rgba(133,183,235,0.14)', text: '#85B7EB', selBg: '#85B7EB' },
  { id: 'conduct', label: 'Conduct',     bg: 'rgba(239,159,39,0.14)',  text: '#EF9F27', selBg: '#EF9F27' },
  { id: 'dev',     label: 'Development', bg: 'rgba(93,202,165,0.14)',  text: '#5DCAA5', selBg: '#5DCAA5' },
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
    <div className="rounded-clausule2 p-4 mb-4 bg-[var(--card)] border border-[var(--rule)]">
      {/* Category pills */}
      <div className="flex items-center gap-1.5 mb-3">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors [background:var(--cat-bg)] [color:var(--cat-text)]"
            style={
              cat === c.id
                ? { '--cat-bg': c.selBg, '--cat-text': '#fff' }
                : { '--cat-bg': c.bg,    '--cat-text': c.text }
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Type pills */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors border ${
              type === t
                ? 'bg-[var(--acc-tint)] text-[var(--acc-text)] border-transparent'
                : 'bg-transparent text-[var(--ts)] border-[var(--rule)]'
            }`}
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
        className="w-full text-[14px] font-bold bg-transparent border-0 border-b border-[var(--rule)] pb-2 mb-3 outline-none text-[var(--tp)]"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Details…"
        rows={3}
        className="w-full text-[13px] text-[var(--ts)] rounded p-2.5 resize-none outline-none mb-3 bg-[rgba(255,255,255,0.04)] border border-[var(--rule)]"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="px-3.5 py-1.5 text-[12px] font-bold rounded-clausule bg-[var(--acc)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Save entry
        </button>
        <button
          onClick={onClose}
          className="text-[12px] text-[var(--tm)]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
