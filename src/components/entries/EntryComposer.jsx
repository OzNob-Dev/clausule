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
    <div
      className="rounded-clausule2 p-4 mb-4"
      style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
    >
      {/* Category pills */}
      <div className="flex items-center gap-1.5 mb-3">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors"
            style={
              cat === c.id
                ? { background: c.selBg, color: '#fff' }
                : { background: c.bg, color: c.text }
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
            className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors"
            style={
              type === t
                ? { background: 'var(--acc-tint)', color: 'var(--acc-text)', border: '1px solid transparent' }
                : { background: 'transparent', color: 'var(--ts)', border: '1px solid var(--rule)' }
            }
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
        className="w-full text-[14px] font-bold bg-transparent border-0 pb-2 mb-3 outline-none"
        style={{
          color: 'var(--tp)',
          borderBottom: '1px solid var(--rule)',
        }}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Details…"
        rows={3}
        className="w-full text-[13px] rounded p-2.5 resize-none outline-none mb-3"
        style={{
          color: 'var(--ts)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--rule)',
        }}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="px-3.5 py-1.5 text-[12px] font-bold rounded-clausule hover:opacity-90 disabled:opacity-40 transition-opacity"
          style={{ background: 'var(--acc)', color: '#fff' }}
        >
          Save entry
        </button>
        <button
          onClick={onClose}
          className="text-[12px]"
          style={{ color: 'var(--tm)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
