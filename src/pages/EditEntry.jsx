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
          <h1 className="text-[20px] font-medium text-tp dark:text-tp-dark">Edit file note</h1>
        </div>

        <div className="bg-card dark:bg-card-dark border border-[rgba(0,0,0,0.07)] rounded-clausule p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-medium text-tm uppercase tracking-[0.5px]">Employee</label>
            <div className="px-3 py-2 text-[14px] text-tp dark:text-tp-dark bg-[rgba(0,0,0,0.03)] rounded-clausule">
              {form.employee}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-medium text-tm uppercase tracking-[0.5px]">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="px-3 py-2 bg-transparent border border-[rgba(0,0,0,0.09)] rounded-clausule text-[14px] text-tp dark:text-tp-dark outline-none focus:border-bl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-medium text-tm uppercase tracking-[0.5px]">Category</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="px-3 py-2 bg-transparent border border-[rgba(0,0,0,0.09)] rounded-clausule text-[14px] text-tp dark:text-tp-dark outline-none focus:border-bl appearance-none"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-medium text-tm uppercase tracking-[0.5px]">Note type</label>
            <div className="flex flex-wrap gap-2">
              {NOTE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => set('type', t)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                    form.type === t
                      ? 'bg-nav text-[#E8ECF8] border-nav'
                      : 'bg-transparent text-ts border-[rgba(0,0,0,0.09)] hover:border-[rgba(0,0,0,0.2)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-medium text-tm uppercase tracking-[0.5px]">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="px-3 py-2 bg-transparent border border-[rgba(0,0,0,0.09)] rounded-clausule text-[14px] text-tp dark:text-tp-dark outline-none focus:border-bl"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-medium text-tm uppercase tracking-[0.5px]">Details</label>
            <textarea
              value={form.details}
              onChange={(e) => set('details', e.target.value)}
              rows={5}
              className="px-3 py-2 bg-transparent border border-[rgba(0,0,0,0.09)] rounded-clausule text-[13px] text-ts dark:text-[#9A9994] outline-none focus:border-bl resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-2.5 pt-1 border-t border-[rgba(0,0,0,0.07)]">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} className="accent-nav" />
              <span className="text-[13px] text-ts dark:text-[#9A9994]">Mark as confidential</span>
            </label>
          </div>

          {/* Metadata */}
          <div className="text-[11px] text-tm pt-1 border-t border-[rgba(0,0,0,0.07)]">
            Created {form.createdAt} · Last edited {form.updatedAt}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 bg-nav text-[#E8ECF8] text-[13px] font-medium rounded-clausule hover:opacity-90 transition-opacity"
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
