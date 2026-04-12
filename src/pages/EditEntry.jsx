import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import '../styles/entry-form.css'

const CATEGORIES = ['Performance', 'Conduct', 'Development']
const NOTE_TYPES = ['Check-in', 'Note', 'Concern', 'Growth', 'Incident', 'Commendation']

const EXISTING = {
  employee: 'Jordan Ellis',
  date: '2025-09-15',
  category: 'Performance',
  type: 'Check-in',
  title: 'Q3 performance check-in',
  details: 'Strong delivery on the authentication refactor. Took initiative on the API design without being asked. Code review quality has improved noticeably.',
  confidential: false,
  createdAt: '2025-09-15',
  updatedAt: '2025-09-15',
}

function Field({ label, children }) {
  return (
    <div className="ef-field">
      <div className="ef-field-label">{label}</div>
      {children}
    </div>
  )
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
      <div className="ef-page">
        <div className="ef-header">
          <button className="ef-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10 4 6 8 10 12"/>
            </svg>
          </button>
          <div className="ef-title">Edit file note</div>
        </div>
        <div className="ef-subtitle">
          Last edited {form.updatedAt} · Created {form.createdAt}
        </div>

        <div className="ef-divider" />

        {/* Employee — read-only */}
        <Field label="Employee">
          <div className="ef-input ef-input--readonly">{form.employee}</div>
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
            className="ef-input"
          />
        </Field>

        {/* Details */}
        <Field label="Details">
          <textarea
            value={form.details}
            onChange={(e) => set('details', e.target.value)}
            rows={6}
            className="ef-input ef-input--textarea"
          />
        </Field>

        {/* Checks */}
        <div className="ef-checks">
          <label>
            <input type="checkbox" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} />
            Confidential
          </label>
        </div>

        {/* Actions */}
        <div className="ef-actions">
          <button onClick={() => navigate(-1)} className="ef-btn-save">
            Save changes
          </button>
          <button onClick={() => navigate(-1)} className="ef-btn-cancel">
            Cancel
          </button>
          <button onClick={handleDelete} className="ef-btn-delete">
            Delete entry
          </button>
        </div>
      </div>
    </AppShell>
  )
}
