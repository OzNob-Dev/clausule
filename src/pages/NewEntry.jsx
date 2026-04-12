import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'

const CATEGORIES = ['Performance', 'Conduct', 'Development']
const NOTE_TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident', 'Commendation']
const EMPLOYEES = ['Jordan Ellis', 'Sara Chen', "Marcus O'Brien", 'Priya Lal', 'Tom Walsh', 'Riya Nair']

const INPUT_CLS = 'px-3 py-2 bg-transparent rounded-clausule text-[14px] text-tp outline-none focus:border-bl transition-colors'

export default function NewEntry() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Performance',
    type: 'Note',
    title: '',
    details: '',
    confidential: false,
    notify: false,
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const handleSave = () => navigate('/dashboard')

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-tm hover:text-ts transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <h1 className="text-[20px] font-black text-tp">New file note</h1>
        </div>

        <div
          className="rounded-clausule2 p-6 flex flex-col gap-5"
          style={{ background: 'var(--card)', border: '1px solid var(--rule)' }}
        >
          {/* Employee */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-tm uppercase tracking-[0.5px]">Employee</label>
            <select
              value={form.employee}
              onChange={(e) => set('employee', e.target.value)}
              className={INPUT_CLS}
              style={{ border: '1px solid var(--rule)' }}
            >
              <option value="">Select employee…</option>
              {EMPLOYEES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
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
              placeholder="Brief title for this note…"
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
              placeholder="What happened? Be specific and factual…"
              className="px-3 py-2 bg-transparent rounded-clausule text-[13px] text-ts outline-none focus:border-bl resize-none leading-relaxed placeholder:text-tm"
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
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notify}
                onChange={(e) => set('notify', e.target.checked)}
                style={{ accentColor: 'var(--acc)' }}
              />
              <span className="text-[13px] text-ts">Notify HR</span>
            </label>
          </div>

          {!form.employee || !form.title ? (
            <p className="text-[11px] text-tm">Employee and title are required.</p>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={!form.employee || !form.title}
              className="px-4 py-2.5 text-[13px] font-bold rounded-clausule hover:opacity-90 disabled:opacity-40 transition-opacity text-white"
              style={{ background: 'var(--acc)' }}
            >
              Save entry
            </button>
            <button onClick={() => navigate(-1)} className="text-[13px] text-tm hover:text-ts">Cancel</button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
