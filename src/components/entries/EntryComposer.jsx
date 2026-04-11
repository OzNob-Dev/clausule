import { useState } from 'react'

const CATS = [
  { id: 'perf',    label: 'Performance', bg: '#E6F1FB', text: '#185FA5', selBg: '#4A6FA5' },
  { id: 'conduct', label: 'Conduct',     bg: '#FAEEDA', text: '#854F0B', selBg: '#BA7517' },
  { id: 'dev',     label: 'Development', bg: '#EAF3DE', text: '#3B6D11', selBg: '#639922' },
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
    <div className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.09)] rounded-clausule p-4 mb-4">
      {/* Category pills */}
      <div className="flex items-center gap-1.5 mb-3">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
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
            className={`px-2.5 py-1 rounded-full text-[11px] transition-colors border ${
              type === t
                ? 'bg-nav text-[#E8ECF8] border-nav'
                : 'bg-transparent text-ts border-[rgba(0,0,0,0.09)] hover:border-[rgba(0,0,0,0.2)]'
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
        className="w-full text-[14px] font-medium text-tp dark:text-tp-dark bg-transparent border-0 border-b border-[rgba(0,0,0,0.09)] pb-2 mb-3 outline-none focus:border-bl placeholder:text-tm placeholder:font-normal"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Details…"
        rows={3}
        className="w-full text-[13px] text-ts dark:text-[#9A9994] bg-transparent border border-[rgba(0,0,0,0.07)] rounded p-2.5 resize-none outline-none focus:border-bl mb-3"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="px-3.5 py-1.5 text-[12px] font-medium bg-nav text-[#E8ECF8] rounded-clausule hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Save entry
        </button>
        <button onClick={onClose} className="text-[12px] text-tm hover:text-ts">Cancel</button>
      </div>
    </div>
  )
}
