import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import '../styles/entry-form.css'

const CATEGORIES = ['Performance', 'Conduct', 'Development']
const NOTE_TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident', 'Commendation']
const EMPLOYEES = ['Jordan Ellis', 'Sara Chen', "Marcus O'Brien", 'Priya Lal', 'Tom Walsh', 'Riya Nair']

function Field({ label, children }) {
  return (
    <div className="ef-field">
      <div className="ef-field-label">{label}</div>
      {children}
    </div>
  )
}

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
      <div className="ef-page">
        <div className="ef-header">
          <button className="ef-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <div className="ef-title">New file note</div>
        </div>
        <div className="ef-subtitle">Document this interaction clearly and factually.</div>

        <div className="ef-divider" />

        {/* Employee */}
        <Field label="Employee">
          <select
            value={form.employee}
            onChange={(e) => set('employee', e.target.value)}
            className="ef-input"
            style={{ appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Select employee…</option>
            {EMPLOYEES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </Field>

        {/* Date + Category */}
        <div className="ef-grid">
          <div>
            <div className="ef-field-label">Date</div>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="ef-input"
            />
          </div>
          <div>
            <div className="ef-field-label">Category</div>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="ef-input"
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Note type */}
        <Field label="Note type">
          <div className="ef-type-btns">
            {NOTE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => set('type', t)}
                className={`ef-type-btn${form.type === t ? ' ef-type-btn--active' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        {/* Title */}
        <Field label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="What is this entry about?"
            className="ef-input"
          />
        </Field>

        {/* Details */}
        <Field label="Details">
          <textarea
            value={form.details}
            onChange={(e) => set('details', e.target.value)}
            rows={6}
            placeholder="What was discussed, agreed, or observed. Write plainly."
            className="ef-input ef-input--textarea"
          />
        </Field>

        {/* Checks */}
        <div className="ef-checks">
          <label>
            <input type="checkbox" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} />
            Confidential
          </label>
          <label>
            <input type="checkbox" checked={form.notify} onChange={(e) => set('notify', e.target.checked)} />
            Notify HR
          </label>
        </div>

        {(!form.employee || !form.title) && (
          <p className="ef-required-msg">Employee and title are required.</p>
        )}

        {/* Actions */}
        <div className="ef-actions">
          <button
            onClick={handleSave}
            disabled={!form.employee || !form.title}
            className="ef-btn-save"
          >
            Save entry
          </button>
          <button onClick={() => navigate(-1)} className="ef-btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </AppShell>
  )
}
