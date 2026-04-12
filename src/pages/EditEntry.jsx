import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'

const CATEGORIES = ['Performance', 'Conduct', 'Development']
const NOTE_TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident', 'Commendation']

// Mock pre-populated entry
const EXISTING = {
  employee: 'Jordan Ellis',
  date: '2025-09-15',
  category: 'Performance',
  type: 'Check-in',
  title: 'Q3 performance check-in',
  details: 'Strong delivery on the authentication refactor. Took initiative on the API design without being asked. Code review quality has improved noticeably.',
  confidential: false,
  notify: false,
  createdAt: '2025-09-15',
  updatedAt: '2025-09-15',
}

const INPUT_CLS = 'px-3 py-2 bg-transparent rounded-clausule text-[14px] text-tp outline-none focus:border-bl transition-colors'

export default function EditEntry() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EXISTING)
  const [deleted, setDeleted] = useState(false)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleDelete = () => {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      setDeleted(true)
      setTimeout(() => navigate('/profile'), 500)
    }
  }

  if (deleted) return null

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-tm hover:text-ts transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <h1 className="text-[20px] font-black text-tp">Edit file note</h1>
        </div>

        <div
          className="rounded-clausule2 p-6 flex flex-col gap-5"
          style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
        >
          {/* Employee — read-only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-tm uppercase tracking-[0.5px]">Employee</label>
            <div
              className="px-3 py-2 text-[14px] text-tp rounded-clausule"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rule)' }}
            >
              {form.employee}
            </div>
          </div>

          {/* Date + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-tm uppercase tracking-[0.5px]">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className={INPUT_CLS}
                style={{ border: '1px solid var(--rule)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-tm uppercase tracking-[0.5px]">Category</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={`${INPUT_CLS} appearance-none`}
                style={{ border: '1px solid var(--rule)' }}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Note type pills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-tm uppercase tracking-[0.5px]">Note type</label>
            <div className="flex flex-wrap gap-2">
              {NOTE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => set('type', t)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors"
                  style={
                    form.type === t
                      ? { background: 'var(--acc-tint)', color: 'var(--acc-text)', border: '1px solid transparent' }
                      : { background: 'transparent', color: 'var(--ts)', border: '1px solid var(--rule)' }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-tm uppercase tracking-[0.5px]">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={INPUT_CLS}
              style={{ border: '1px solid var(--rule)' }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-tm uppercase tracking-[0.5px]">Details</label>
            <textarea
              value={form.details}
              onChange={(e) => set('details', e.target.value)}
              rows={5}
              className="px-3 py-2 bg-transparent rounded-clausule text-[13px] text-ts outline-none focus:border-bl resize-none leading-relaxed"
              style={{ border: '1px solid var(--rule)' }}
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5 pt-1" style={{ borderTop: '1px solid var(--rule)' }}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confidential}
                onChange={(e) => set('confidential', e.target.checked)}
                style={{ accentColor: 'var(--acc)' }}
              />
              <span className="text-[13px] text-ts">Mark as confidential</span>
            </label>
          </div>

          {/* Metadata */}
          <div className="text-[11px] text-tm pt-1" style={{ borderTop: '1px solid var(--rule)' }}>
            Created {form.createdAt} · Last edited {form.updatedAt}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-[13px] font-bold rounded-clausule hover:opacity-90 transition-opacity text-white"
              style={{ background: 'var(--acc)' }}
            >
              Save changes
            </button>
            <button onClick={() => navigate(-1)} className="text-[13px] text-tm hover:text-ts">Cancel</button>
            <button onClick={handleDelete} className="text-[13px] text-rt hover:opacity-80 ml-auto">Delete entry</button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
